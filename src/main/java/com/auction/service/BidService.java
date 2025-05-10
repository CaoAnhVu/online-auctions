package com.auction.service;

import com.auction.model.Bid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Optional;

public interface BidService {
    Bid placeBid(Long auctionId, Long userId, BigDecimal amount);
    Page<Bid> getBidsByAuction(Long auctionId, Pageable pageable);
    Page<Bid> getBidsByUser(Long userId, Pageable pageable);
    Optional<Bid> getWinningBid(Long auctionId);
} 