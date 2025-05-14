package com.auction.payment.service.impl;

import com.auction.model.Auction;
import com.auction.model.User;
import com.auction.payment.dto.PaymentRequest;
import com.auction.payment.dto.PaymentResponse;
import com.auction.enums.PaymentStatus;
import com.auction.payment.model.PaymentOrder;
import com.auction.payment.repository.PaymentOrderRepository;
import com.auction.payment.service.PaymentService;
import com.auction.payment.service.VNPayService;
import com.auction.repository.AuctionRepository;
import com.auction.payment.enums.PaymentMethod;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentOrderRepository paymentOrderRepository;
    private final AuctionRepository auctionRepository;
    private final VNPayService vnPayService;
    private final JavaMailSender emailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request, User user) {
        PaymentOrder paymentOrder = new PaymentOrder();
        paymentOrder.setOrderCode(generateOrderCode());
        paymentOrder.setUser(user);
        paymentOrder.setAmount(request.getAmount());
        paymentOrder.setPaymentMethod(PaymentMethod.VNPAY);
        paymentOrder.setStatus(PaymentStatus.PENDING);
        paymentOrder.setCreatedAt(LocalDateTime.now());
        paymentOrder.setExpiresAt(LocalDateTime.now().plusHours(24));

        paymentOrder = paymentOrderRepository.save(paymentOrder);

        // Generate VNPay payment URL
        String paymentUrl = vnPayService.createPaymentUrl(paymentOrder);
        paymentOrder.setPaymentUrl(paymentUrl);
        paymentOrderRepository.save(paymentOrder);

        PaymentResponse response = new PaymentResponse();
        response.setOrderCode(paymentOrder.getOrderCode());
        response.setAmount(paymentOrder.getAmount());
        response.setPaymentMethod(paymentOrder.getPaymentMethod());
        response.setStatus(paymentOrder.getStatus());
        response.setPaymentUrl(paymentUrl);
        response.setExpiresAt(paymentOrder.getExpiresAt());

        return response;
    }

    @Override
    public Long getAuctionIdForPayment(String orderCode) {
        PaymentOrder paymentOrder = getPaymentByOrderCode(orderCode);
        return paymentOrder.getAuctionId();
    }

    @Override
    public Auction getAuctionById(Long auctionId) {
        return auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found: " + auctionId));
    }

    @Override
    public List<PaymentOrder> findExpiredPayments(LocalDateTime now) {
        return paymentOrderRepository.findExpiredPayments(now);
    }

    @Override
    public PaymentOrder getPaymentById(Long id) {
        return paymentOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    @Override
    public PaymentOrder getPaymentByOrderCode(String orderCode) {
        return paymentOrderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Payment not found with order code: " + orderCode));
    }

    @Override
    public List<PaymentOrder> getUserPayments(User user) {
        return paymentOrderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    @Transactional
    public PaymentOrder updatePaymentStatus(String orderCode, PaymentStatus status) {
        PaymentOrder payment = getPaymentByOrderCode(orderCode);
        payment.setStatus(status);
        if (status == PaymentStatus.COMPLETED) {
            payment.setPaidAt(LocalDateTime.now());
        }
        return paymentOrderRepository.save(payment);
    }

    @Override
    @Transactional
    public void processPaymentCallback(String orderCode, String transactionId, String status) {
        PaymentOrder payment = getPaymentByOrderCode(orderCode);
        
        // For development environment, always update to COMPLETED
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        paymentOrderRepository.save(payment);
        
        log.info("Processed payment callback for order: {}, status: {}", orderCode, status);
    }

    @Override
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    @Transactional
    public void checkAndUpdateExpiredPayments() {
        List<PaymentOrder> pendingPayments = paymentOrderRepository.findByStatus(PaymentStatus.PENDING);
        LocalDateTime now = LocalDateTime.now();
        
        for (PaymentOrder payment : pendingPayments) {
            if (payment.getExpiresAt().isBefore(now)) {
                payment.setStatus(PaymentStatus.EXPIRED);
                paymentOrderRepository.save(payment);
                log.info("Payment expired: {}", payment.getOrderCode());
            }
        }
    }

    @Override
    public String generateQrCode(PaymentOrder paymentOrder) {
        // For development environment, we don't generate QR codes
        // since we're using VNPay's payment gateway
        throw new UnsupportedOperationException("QR code generation is not supported in development environment. Please use VNPay payment URL.");
    }

    @Override
    public void sendPaymentEmail(PaymentOrder paymentOrder) {
        try {
            var message = emailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true);
            
            helper.setTo(paymentOrder.getUser().getEmail());
            helper.setSubject("Payment Information for Order " + paymentOrder.getOrderCode());
            
            var context = new org.thymeleaf.context.Context();
            context.setVariable("userName", paymentOrder.getUser().getFullName());
            context.setVariable("orderCode", paymentOrder.getOrderCode());
            context.setVariable("amount", paymentOrder.getAmount());
            context.setVariable("dueDate", paymentOrder.getExpiresAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            context.setVariable("paymentUrl", paymentOrder.getPaymentUrl());
            context.setVariable("transactionUrl", baseUrl + "/payments/" + paymentOrder.getOrderCode());
            
            String emailContent = templateEngine.process("payment-vnpay", context);
            helper.setText(emailContent, true);
            
            emailSender.send(message);
            
            log.info("Payment email sent successfully to: {}", paymentOrder.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send payment email", e);
            throw new RuntimeException("Failed to send payment email", e);
        }
    }

    private String generateOrderCode() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}