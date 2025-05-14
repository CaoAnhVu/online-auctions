package com.auction.payment.dto;

import com.auction.payment.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull(message = "Auction ID is required")
    private Long auctionId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String bankCode; // Optional, for bank transfer

    private String description;

    private String language = "vn";

    private String orderInfo;
} 