package com.auction.payment.dto;

import com.auction.payment.enums.PaymentMethod;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Long auctionId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String bankCode; // Optional, for bank transfer
} 