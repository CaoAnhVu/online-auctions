package com.auction.payment.dto;

import com.auction.payment.enums.PaymentMethod;
import com.auction.enums.PaymentStatus;
import com.auction.payment.model.PaymentOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String orderCode;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String bankInfo;
    private String qrCodeUrl;
    private String transferContent;
    private String paymentUrl;
    private LocalDateTime expiresAt;
    private String message;
    private String transactionId;
    private String bankCode;
    private String responseCode;
    
    // Additional fields for e-wallet payments
    private String deeplink;   // For mobile app integration

    public PaymentOrder toPaymentOrder() {
        PaymentOrder order = new PaymentOrder();
        order.setOrderCode(this.orderCode);
        order.setAmount(this.amount);
        order.setPaymentMethod(this.paymentMethod);
        order.setStatus(this.status);
        order.setBankInfo(this.bankInfo);
        order.setQrCodeUrl(this.qrCodeUrl);
        order.setTransferContent(this.transferContent);
        order.setPaymentUrl(this.paymentUrl);
        order.setExpiresAt(this.expiresAt);
        order.setCreatedAt(LocalDateTime.now());
        return order;
    }
} 