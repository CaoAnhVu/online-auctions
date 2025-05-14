package com.auction.service;

import com.auction.model.Auction;
import com.auction.model.Bid;
import com.auction.model.User;
import com.auction.payment.dto.PaymentRequest;
import com.auction.payment.model.PaymentOrder;
import com.auction.payment.service.PaymentService;
import com.auction.payment.service.PaymentNotificationService;
import com.auction.enums.PaymentStatus;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuctionWinnerService {

    private final JavaMailSender emailSender;
    private final SpringTemplateEngine templateEngine;
    private final PaymentService paymentService;
    private final PaymentNotificationService paymentNotificationService;

    @Value("${app.base-url}")
    private String baseUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Transactional
    public void processAuctionWinner(Auction auction, Bid winningBid) {
        User winner = winningBid.getBidder();
        
        // Create payment order
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setAmount(winningBid.getAmount());
        paymentRequest.setDescription("Payment for winning auction: " + auction.getTitle());
        paymentRequest.setAuctionId(auction.getId());
        
        PaymentOrder paymentOrder = paymentService.createPayment(paymentRequest, winner).toPaymentOrder();
        
        // Send congratulatory email with payment information
        sendWinnerEmail(auction, winningBid, winner, paymentOrder);
        
        log.info("Processed auction winner for auction: {}, winner: {}, amount: {}", 
                auction.getId(), winner.getUsername(), winningBid.getAmount());
    }

    private void sendWinnerEmail(Auction auction, Bid winningBid, User winner, PaymentOrder paymentOrder) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(winner.getEmail());
            helper.setSubject("Congratulations! You've Won the Auction - " + auction.getTitle());
            
            Context context = new Context();
            context.setVariable("userName", winner.getFullName());
            context.setVariable("auctionTitle", auction.getTitle());
            context.setVariable("winningBid", winningBid.getAmount());
            context.setVariable("auctionEndTime", auction.getEndTime().format(DATE_FORMATTER));
            context.setVariable("orderCode", paymentOrder.getOrderCode());
            context.setVariable("paymentUrl", paymentOrder.getPaymentUrl());
            context.setVariable("paymentDueDate", paymentOrder.getExpiresAt().format(DATE_FORMATTER));
            context.setVariable("auctionDetailsUrl", baseUrl + "/auctions/" + auction.getId());
            
            String emailContent = templateEngine.process("auction-winner", context);
            helper.setText(emailContent, true);
            
            emailSender.send(message);
            
            log.info("Sent winner notification email to: {}", winner.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send winner notification email", e);
            throw new RuntimeException("Failed to send winner notification email", e);
        }
    }

    @Transactional
    public void handlePaymentStatusUpdate(PaymentOrder paymentOrder, PaymentStatus newStatus) {
        if (paymentOrder.getStatus() == newStatus) {
            return; // Status hasn't changed
        }

        paymentOrder.setStatus(newStatus);
        
        // Get auction and buyer information
        Long auctionId = paymentService.getAuctionIdForPayment(paymentOrder.getOrderCode());
        Auction auction = paymentService.getAuctionById(auctionId);
        User buyer = paymentOrder.getUser();

        switch (newStatus) {
            case COMPLETED:
                // Send notification to seller
                paymentNotificationService.sendPaymentNotificationToSeller(auction, paymentOrder, buyer);
                break;
            case EXPIRED:
                paymentNotificationService.sendPaymentExpiredNotification(auction, paymentOrder);
                break;
            case CANCELLED:
                paymentNotificationService.sendPaymentCancelledNotification(auction, paymentOrder);
                break;
            default:
                log.debug("Payment status updated to {} for order {}", newStatus, paymentOrder.getOrderCode());
        }
    }

    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    @Transactional
    public void checkExpiredPayments() {
        LocalDateTime now = LocalDateTime.now();
        List<PaymentOrder> expiredPayments = paymentService.findExpiredPayments(now);
        
        for (PaymentOrder payment : expiredPayments) {
            if (payment.getStatus() == PaymentStatus.PENDING) {
                handlePaymentStatusUpdate(payment, PaymentStatus.EXPIRED);
            }
        }
    }
} 