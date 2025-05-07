package com.auction.dto;

import com.auction.model.AuctionStatus;
import com.auction.model.ItemCondition;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AuctionResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal startingPrice;
    private BigDecimal currentPrice;
    private BigDecimal minimumBidIncrement;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AuctionStatus status;
    private ItemCondition condition;
    private String category;
    private int viewCount;
    private int bidCount;
    private Long sellerId;
    private Long winnerId;
    private UserDTO seller;
    private UserDTO winner;
    private List<BidDTO> bids;
    private List<AuctionImageDTO> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive;
    private boolean isEnded;
    private boolean isCancelled;
} 