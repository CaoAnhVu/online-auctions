package com.auction.payment.service;

import com.auction.model.Auction;
import com.auction.model.User;
import com.auction.payment.model.PaymentOrder;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.format.DateTimeFormatter;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentNotificationService {
    private final JavaMailSender emailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${payment.deadline-hours}")
    private int paymentDeadlineHours;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public void sendAuctionWinnerNotification(Auction auction, User winner, PaymentOrder paymentOrder) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(winner.getEmail());
            helper.setSubject("Congratulations! You've Won the Auction - " + auction.getTitle());
            
            Context context = new Context();
            context.setVariable("winnerName", winner.getFullName());
            context.setVariable("auctionTitle", auction.getTitle());
            context.setVariable("winningAmount", paymentOrder.getAmount());
            context.setVariable("paymentDeadline", paymentOrder.getCreatedAt().plusHours(paymentDeadlineHours).format(DATE_FORMATTER));
            context.setVariable("orderCode", paymentOrder.getOrderCode());
            context.setVariable("qrCodeUrl", paymentOrder.getQrCodeUrl());
            context.setVariable("auctionDetailsUrl", baseUrl + "/auctions/" + auction.getId());
            context.setVariable("paymentInstructions", "Please complete your payment within " + paymentDeadlineHours + " hours");
            
            // Thông tin người bán
            context.setVariable("sellerName", auction.getSeller().getFullName());
            context.setVariable("sellerEmail", auction.getSeller().getEmail());
            context.setVariable("sellerPhone", auction.getSeller().getPhoneNumber());
            
            String emailContent = templateEngine.process("auction-winner-notification", context);
            helper.setText(emailContent, true);
            
            emailSender.send(message);
            log.info("Sent auction winner notification email to: {}", winner.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send auction winner notification email", e);
            throw new RuntimeException("Failed to send auction winner notification email", e);
        }
    }

    public void sendPaymentNotification(PaymentOrder paymentOrder, User user) {
        Context context = new Context();
        context.setVariable("user", user);
        context.setVariable("orderCode", paymentOrder.getOrderCode());
        context.setVariable("amount", paymentOrder.getAmount());
        context.setVariable("qrCode", paymentOrder.getQrCodeUrl());
        
        String emailContent = templateEngine.process("email/payment-notification", context);
        
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject("Payment Notification");
            helper.setText(emailContent, true);
            emailSender.send(message);
        } catch (MessagingException e) {
            log.error("Error sending payment notification email", e);
        }
    }

    public void sendPaymentConfirmation(PaymentOrder paymentOrder, User user) {
        Context context = new Context();
        context.setVariable("user", user);
        context.setVariable("orderCode", paymentOrder.getOrderCode());
        context.setVariable("amount", paymentOrder.getAmount());
        
        String emailContent = templateEngine.process("email/payment-confirmation", context);
        
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject("Payment Confirmation");
            helper.setText(emailContent, true);
            emailSender.send(message);
        } catch (MessagingException e) {
            log.error("Error sending payment confirmation email", e);
        }
    }

    public void sendPaymentNotificationToSeller(Auction auction, PaymentOrder paymentOrder, User buyer) {
        try {
            User seller = auction.getSeller();
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(seller.getEmail());
            helper.setSubject("Payment Received - " + auction.getTitle());

            Context context = new Context();
            context.setVariable("sellerName", seller.getFullName());
            context.setVariable("auctionTitle", auction.getTitle());
            context.setVariable("paymentAmount", paymentOrder.getAmount());
            context.setVariable("paymentDate", paymentOrder.getUpdatedAt().format(DATE_FORMATTER));
            context.setVariable("transactionId", paymentOrder.getOrderCode());
            context.setVariable("buyerName", buyer.getFullName());
            context.setVariable("buyerEmail", buyer.getEmail());
            context.setVariable("buyerPhone", buyer.getPhoneNumber());
            context.setVariable("auctionDetailsUrl", baseUrl + "/auctions/" + auction.getId());

            String emailContent = templateEngine.process("seller-payment-notification", context);
            helper.setText(emailContent, true);

            emailSender.send(message);
            log.info("Sent payment notification email to seller: {}", seller.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send payment notification email to seller", e);
            throw new RuntimeException("Failed to send payment notification email", e);
        }
    }

    public void sendPaymentExpiredNotification(Auction auction, PaymentOrder paymentOrder) {
        // TODO: Implement payment expired notification
        log.info("Payment expired for auction: {}, order: {}", auction.getId(), paymentOrder.getOrderCode());
    }

    public void sendPaymentCancelledNotification(Auction auction, PaymentOrder paymentOrder) {
        // TODO: Implement payment cancelled notification
        log.info("Payment cancelled for auction: {}, order: {}", auction.getId(), paymentOrder.getOrderCode());
    }
} 