package com.auction.payment.service;

import com.auction.payment.model.PaymentOrder;
import java.util.Map;

public interface VNPayService {
    String createPaymentUrl(PaymentOrder order);
    boolean validatePaymentResponse(Map<String, String> response);
} 