package com.auction.payment.dto;

import com.auction.payment.enums.PaymentMethod;
import com.auction.payment.model.PaymentOrder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private String orderCode;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentOrder.PaymentStatus status;
    private String bankInfo;
    private String qrCodeUrl;
    private String transferContent;
    private LocalDateTime expiresAt;
    
    // Additional fields for e-wallet payments
    private String paymentUrl; // For MOMO, ZaloPay, VNPay redirects
    private String deeplink;   // For mobile app integration
} 