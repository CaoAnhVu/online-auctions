package com.auction.payment.service;

import com.auction.model.User;
import com.auction.payment.dto.PaymentRequest;
import com.auction.payment.dto.PaymentResponse;
import com.auction.payment.model.PaymentOrder;
import java.util.List;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request, User user);
    PaymentOrder getPaymentById(Long id);
    PaymentOrder getPaymentByOrderCode(String orderCode);
    List<PaymentOrder> getUserPayments(User user);
    PaymentOrder updatePaymentStatus(String orderCode, PaymentOrder.PaymentStatus status);
    void processPaymentCallback(String orderCode, String transactionId, String status);
    void checkAndUpdateExpiredPayments();
    String generateQrCode(PaymentOrder paymentOrder);
    void sendPaymentEmail(PaymentOrder paymentOrder);
} 