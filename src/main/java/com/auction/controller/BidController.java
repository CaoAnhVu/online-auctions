package com.auction.controller;

import com.auction.dto.BidRequest;
import com.auction.dto.BidResponse;
import com.auction.model.Bid;
import com.auction.service.BidService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
public class BidController {
    private final BidService bidService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> placeBid(@RequestBody BidRequest request, org.springframework.security.core.Authentication authentication) {
        try {
            log.info("Received bid request: {}", request);
            
            // Validate request
            if (request == null || request.getAuctionId() == null || request.getAmount() == null) {
                log.error("Invalid bid request: {}", request);
                return ResponseEntity.badRequest().body("Invalid bid request");
            }

            // Get user ID from authentication
            Long userId = ((com.auction.security.UserPrincipal) authentication.getPrincipal()).getId();
            log.info("User ID from authentication: {}", userId);

            // Try to place bid
            Bid bid = bidService.placeBid(
                request.getAuctionId(),
                userId,
                request.getAmount()
            );

            // Map to response
            BidResponse response = mapToBidResponse(bid);
            log.info("Successfully placed bid: {}", response);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error placing bid", e);
            return ResponseEntity.internalServerError().body("Error placing bid: " + e.getMessage());
        }
    }

    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<Page<BidResponse>> getBidsByAuction(
            @PathVariable Long auctionId,
            Pageable pageable) {
        try {
            log.info("Getting bids for auction: {}", auctionId);
            Page<Bid> bids = bidService.getBidsByAuction(auctionId, pageable);
            return ResponseEntity.ok(bids.map(this::mapToBidResponse));
        } catch (Exception e) {
            log.error("Error getting bids for auction: {}", auctionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Page<BidResponse>> getBidsByUser(
            @PathVariable Long userId,
            Pageable pageable) {
        try {
            log.info("Getting bids for user: {}", userId);
            Page<Bid> bids = bidService.getBidsByUser(userId, pageable);
            return ResponseEntity.ok(bids.map(this::mapToBidResponse));
        } catch (Exception e) {
            log.error("Error getting bids for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/auction/{auctionId}/winning")
    public ResponseEntity<BidResponse> getWinningBid(@PathVariable Long auctionId) {
        try {
            log.info("Getting winning bid for auction: {}", auctionId);
            return bidService.getWinningBid(auctionId)
                    .map(this::mapToBidResponse)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting winning bid for auction: {}", auctionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private BidResponse mapToBidResponse(Bid bid) {
        try {
            BidResponse response = new BidResponse();
            response.setId(bid.getId());
            response.setAuctionId(bid.getAuction().getId());
            response.setBidderId(bid.getBidder().getId());
            response.setUsername(bid.getBidder().getUsername());
            response.setAmount(bid.getAmount());
            response.setBidTime(bid.getBidTime());
            response.setWinning(bid.isWinning());
            return response;
        } catch (Exception e) {
            log.error("Error mapping bid to response", e);
            throw e;
        }
    }
} 