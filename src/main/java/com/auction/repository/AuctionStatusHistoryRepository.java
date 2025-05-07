package com.auction.repository;

import com.auction.model.AuctionStatusHistory;
import com.auction.model.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuctionStatusHistoryRepository extends JpaRepository<AuctionStatusHistory, Long> {
    List<AuctionStatusHistory> findByAuctionOrderByChangedAtDesc(Auction auction);
} 