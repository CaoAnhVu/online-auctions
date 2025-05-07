package com.auction.repository;

import com.auction.model.Auction;
import com.auction.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByAuction(Auction auction);
    Optional<Image> findByAuctionAndPrimaryTrue(Auction auction);
    void deleteByAuction(Auction auction);
} 