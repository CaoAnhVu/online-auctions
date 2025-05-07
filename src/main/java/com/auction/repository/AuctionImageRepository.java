package com.auction.repository;

import com.auction.model.Auction;
import com.auction.model.AuctionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionImageRepository extends JpaRepository<AuctionImage, Long> {
    List<AuctionImage> findByAuction(Auction auction);
    void deleteByAuction(Auction auction);
} 