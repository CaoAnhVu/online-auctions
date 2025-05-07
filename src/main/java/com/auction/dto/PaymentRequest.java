package com.auction.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull(message = "Auction ID is required")
    private Long auctionId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Long amount;

    private String orderInfo;
    
    @NotNull(message = "Bank code is required")
    private String bankCode;
    
    private String language = "vn";
} 