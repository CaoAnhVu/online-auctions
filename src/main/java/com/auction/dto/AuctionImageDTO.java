package com.auction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionImageDTO {
    private Long id;
    private String imageUrl;
    private String description;
    private LocalDateTime uploadedAt;
    private Long auctionId;
}