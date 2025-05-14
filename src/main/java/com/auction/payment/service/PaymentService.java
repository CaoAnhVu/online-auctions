package com.auction.payment.service;

import com.auction.model.Auction;
import com.auction.model.User;
import com.auction.payment.dto.PaymentRequest;
import com.auction.payment.dto.PaymentResponse;
import com.auction.payment.model.PaymentOrder;
import com.auction.enums.PaymentStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request, User user);
    Long getAuctionIdForPayment(String orderCode);
    Auction getAuctionById(Long auctionId);
    List<PaymentOrder> findExpiredPayments(LocalDateTime now);
    PaymentOrder getPaymentById(Long id);
    PaymentOrder getPaymentByOrderCode(String orderCode);
    List<PaymentOrder> getUserPayments(User user);
    PaymentOrder updatePaymentStatus(String orderCode, PaymentStatus status);
    void processPaymentCallback(String orderCode, String transactionId, String status);
    void checkAndUpdateExpiredPayments();
    String generateQrCode(PaymentOrder paymentOrder);
    void sendPaymentEmail(PaymentOrder paymentOrder);
}