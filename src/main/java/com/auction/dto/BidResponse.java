package com.auction.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BidResponse {
    private Long id;
    private Long auctionId;
    private Long bidderId;
    private BigDecimal amount;
    private LocalDateTime bidTime;
    private String status;
    private UserDTO bidder;
    private AuctionDTO auction;
    private boolean isWinning;
} 