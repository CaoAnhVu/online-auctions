package com.auction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String status;
    private String message;
    private String paymentUrl;
    private String transactionId;
    private Long amount;
    private String orderInfo;
    private String bankCode;
    private String responseCode;
} 