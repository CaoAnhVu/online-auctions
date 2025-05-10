package com.auction.repository;

import com.auction.model.Auction;
import com.auction.model.Bid;
import com.auction.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    @EntityGraph(attributePaths = "bidder")
    Page<Bid> findByAuction(Auction auction, Pageable pageable);
    
    @EntityGraph(attributePaths = "bidder")
    Page<Bid> findByBidder(User bidder, Pageable pageable);
    
    @Query("SELECT b FROM Bid b WHERE b.auction = :auction AND b.winning = true")
    Optional<Bid> findWinningBid(@Param("auction") Auction auction);
    
    @Query("SELECT b FROM Bid b WHERE b.auction = :auction ORDER BY b.amount DESC")
    List<Bid> findTopBids(@Param("auction") Auction auction, Pageable pageable);
    
    Optional<Bid> findTopByAuctionOrderByAmountDesc(Auction auction);
    
    @Query("SELECT COUNT(b) FROM Bid b WHERE b.auction = :auction")
    Long countByAuction(Auction auction);
} 