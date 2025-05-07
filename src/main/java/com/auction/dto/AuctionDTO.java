package com.auction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionDTO {
    private Long id;

    @NotBlank
    @Size(min = 3, max = 100)
    private String title;

    @NotBlank
    @Size(min = 10, max = 1000)
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal startingPrice;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal currentPrice;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal minBidIncrement;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    private String status;
    private Long sellerId;
    private Long winnerId;
    private Long categoryId;

    private UserDTO seller;
    private UserDTO winner;
    private List<BidDTO> bids;
    private List<AuctionImageDTO> images;
    private Long bidCount;
    private boolean isActive;
    private boolean isEnded;
    private boolean isCancelled;
} 