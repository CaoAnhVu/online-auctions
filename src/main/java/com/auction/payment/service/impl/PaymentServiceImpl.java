package com.auction.payment.service.impl;

import com.auction.model.User;
import com.auction.payment.dto.PaymentRequest;
import com.auction.payment.dto.PaymentResponse;
import com.auction.payment.enums.PaymentMethod;
import com.auction.payment.model.PaymentOrder;
import com.auction.payment.repository.PaymentOrderRepository;
import com.auction.payment.service.PaymentService;
import com.auction.payment.util.QrCodeGenerator;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private QrCodeGenerator qrCodeGenerator;

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private VNPayService vnPayService;

    @Value("${payment.bank.id}")
    private String bankId;

    @Value("${payment.bank.account}")
    private String bankAccount;

    @Value("${payment.bank.name}")
    private String bankName;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request, User user) {
        PaymentOrder paymentOrder = new PaymentOrder();
        paymentOrder.setOrderCode(generateOrderCode());
        paymentOrder.setUser(user);
        paymentOrder.setAmount(request.getAmount());
        paymentOrder.setPaymentMethod(request.getPaymentMethod());
        paymentOrder.setStatus(PaymentOrder.PaymentStatus.PENDING);
        paymentOrder.setCreatedAt(LocalDateTime.now());
        paymentOrder.setExpiresAt(LocalDateTime.now().plusHours(24));

        // Set bank information for bank transfers
        if (request.getPaymentMethod() == PaymentMethod.BANK_TRANSFER) {
            paymentOrder.setBankInfo(String.format("%s - %s - %s", bankName, bankAccount, bankId));
            paymentOrder.setTransferContent(String.format("AUCTION-%s", paymentOrder.getOrderCode()));
            
            // Generate QR code
            String qrContent = qrCodeGenerator.generateVietQRContent(
                bankId,
                bankAccount,
                request.getAmount().toString(),
                paymentOrder.getTransferContent()
            );
            String qrCodeUrl = qrCodeGenerator.generateQrCodeBase64(qrContent);
            paymentOrder.setQrCodeUrl(qrCodeUrl);
        }

        paymentOrder = paymentOrderRepository.save(paymentOrder);
        
        PaymentResponse response = createPaymentResponse(paymentOrder);

        // Xử lý theo phương thức thanh toán
        if (request.getPaymentMethod() == PaymentMethod.VNPAY) {
            // Lấy IP của người dùng (trong thực tế sẽ lấy từ HttpServletRequest)
            String ipAddress = "127.0.0.1"; // Giá trị mặc định cho dev
            String vnpayUrl = vnPayService.createPaymentUrl(paymentOrder, ipAddress);
            response.setPaymentUrl(vnpayUrl);
        }

        // Gửi email thông báo
        sendPaymentEmail(paymentOrder);

        return response;
    }

    @Override
    public PaymentOrder getPaymentById(Long id) {
        return paymentOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    @Override
    public PaymentOrder getPaymentByOrderCode(String orderCode) {
        return paymentOrderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    @Override
    public List<PaymentOrder> getUserPayments(User user) {
        return paymentOrderRepository.findByUser(user);
    }

    @Override
    @Transactional
    public PaymentOrder updatePaymentStatus(String orderCode, PaymentOrder.PaymentStatus status) {
        PaymentOrder payment = getPaymentByOrderCode(orderCode);
        payment.setStatus(status);
        if (status == PaymentOrder.PaymentStatus.PAID) {
            payment.setPaidAt(LocalDateTime.now());
        }
        return paymentOrderRepository.save(payment);
    }

    @Override
    @Transactional
    public void processPaymentCallback(String orderCode, String transactionId, String status) {
        PaymentOrder payment = getPaymentByOrderCode(orderCode);
        
        // Trong môi trường dev, luôn cập nhật thành công
        if (payment.getPaymentMethod() == PaymentMethod.VNPAY) {
            payment.setStatus(PaymentOrder.PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            paymentOrderRepository.save(payment);
        }
    }

    @Override
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    @Transactional
    public void checkAndUpdateExpiredPayments() {
        List<PaymentOrder> pendingPayments = paymentOrderRepository.findByStatus(PaymentOrder.PaymentStatus.PENDING);
        LocalDateTime now = LocalDateTime.now();
        
        for (PaymentOrder payment : pendingPayments) {
            if (payment.getExpiresAt().isBefore(now)) {
                payment.setStatus(PaymentOrder.PaymentStatus.EXPIRED);
                paymentOrderRepository.save(payment);
            }
        }
    }

    @Override
    public String generateQrCode(PaymentOrder paymentOrder) {
        if (paymentOrder.getPaymentMethod() != PaymentMethod.BANK_TRANSFER) {
            throw new RuntimeException("QR code is only available for bank transfers");
        }
        
        String qrContent = qrCodeGenerator.generateVietQRContent(
            bankId,
            bankAccount,
            paymentOrder.getAmount().toString(),
            paymentOrder.getTransferContent()
        );
        
        return qrCodeGenerator.generateQrCodeBase64(qrContent);
    }

    @Override
    public void sendPaymentEmail(PaymentOrder paymentOrder) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(paymentOrder.getUser().getEmail());
            helper.setSubject("Payment Information for Order " + paymentOrder.getOrderCode());
            
            String emailContent = buildEmailContent(paymentOrder);
            helper.setText(emailContent, true);
            
            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send payment email", e);
        }
    }

    private String generateOrderCode() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private PaymentResponse createPaymentResponse(PaymentOrder order) {
        PaymentResponse response = new PaymentResponse();
        response.setOrderCode(order.getOrderCode());
        response.setAmount(order.getAmount());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setStatus(order.getStatus());
        response.setBankInfo(order.getBankInfo());
        response.setQrCodeUrl(order.getQrCodeUrl());
        response.setTransferContent(order.getTransferContent());
        response.setExpiresAt(order.getExpiresAt());
        return response;
    }

    private String buildEmailContent(PaymentOrder paymentOrder) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body>");
        html.append("<h2>Payment Information</h2>");
        html.append("<p>Order Code: ").append(paymentOrder.getOrderCode()).append("</p>");
        html.append("<p>Amount: ").append(paymentOrder.getAmount()).append(" VND</p>");
        html.append("<p>Payment Method: ").append(paymentOrder.getPaymentMethod()).append("</p>");
        
        if (paymentOrder.getPaymentMethod() == PaymentMethod.BANK_TRANSFER) {
            html.append("<p>Bank Information: ").append(paymentOrder.getBankInfo()).append("</p>");
            html.append("<p>Transfer Content: ").append(paymentOrder.getTransferContent()).append("</p>");
            html.append("<p>QR Code for payment:</p>");
            html.append("<img src='cid:qr-code' alt='QR Code' style='width:300px;height:300px;'/>");
        }
        
        if (paymentOrder.getPaymentMethod() == PaymentMethod.VNPAY) {
            html.append("<p>Please complete your payment through VNPay portal.</p>");
        }
        
        html.append("<p>Expires at: ").append(paymentOrder.getExpiresAt()).append("</p>");
        html.append("</body></html>");
        return html.toString();
    }
} 