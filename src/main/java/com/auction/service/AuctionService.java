package com.auction.service;

import com.auction.model.Auction;
import com.auction.model.AuctionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;

public interface AuctionService {
    Auction createAuction(Auction auction, Long sellerId);
    Page<Auction> getAllAuctions(Pageable pageable);
    Auction getAuctionById(Long id);
    Page<Auction> searchAuctions(String keyword, String category, Double minPrice, Double maxPrice, AuctionStatus status, Pageable pageable);
    Auction updateAuction(Long id, Auction updatedAuction);
    void deleteAuction(Long id);
    void incrementViewCount(Long id);
    void updateAuctionStatus(Long id, AuctionStatus status);
    void processEndedAuctions();
    void startPendingAuctions();
    List<Auction> getAllAuctions();
    List<Auction> getAuctionsBySeller(Long sellerId);
    List<Auction> searchAuctions(String keyword);
    List<Auction> getAuctionsByCategory(String category);
    List<Auction> getAuctionsByStatus(AuctionStatus status);
    void startAuction(Long id);
    void endAuction(Long id);
    void cancelAuction(Long id);
    void updateCurrentPrice(Long id, BigDecimal newPrice);
    boolean isValidBidAmount(Long id, BigDecimal bidAmount);
    void addAuctionImage(Long id, String imageUrl);
    void removeAuctionImage(Long id, String imageUrl);
    List<String> getAuctionImages(Long id);
    int getTotalActiveAuctions();
    BigDecimal getHighestBidForAuction(Long id);
    int getTotalBidsForAuction(Long id);
    void checkAndUpdateExpiredAuctions();
} 