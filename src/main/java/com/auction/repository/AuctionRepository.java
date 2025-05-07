package com.auction.repository;

import com.auction.model.Auction;
import com.auction.model.AuctionStatus;
import com.auction.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    Page<Auction> findByStatus(AuctionStatus status, Pageable pageable);
    Page<Auction> findBySeller(User seller, Pageable pageable);
    Page<Auction> findByCategory(String category, Pageable pageable);
    Page<Auction> findByFeaturedTrue(Pageable pageable);
    
    @Query("SELECT a FROM Auction a WHERE " +
           "(:keyword IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:minPrice IS NULL OR a.currentPrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR a.currentPrice <= :maxPrice) AND " +
           "(:status IS NULL OR a.status = :status)")
    Page<Auction> searchAuctions(
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("status") AuctionStatus status,
            Pageable pageable);

    @Query("SELECT a FROM Auction a WHERE a.endTime <= :now AND a.status = 'ACTIVE'")
    List<Auction> findEndedAuctions(@Param("now") LocalDateTime now);

    @Query("SELECT a FROM Auction a WHERE a.startTime <= :now AND a.status = 'PENDING'")
    List<Auction> findAuctionsToStart(@Param("now") LocalDateTime now);

    long countByStatus(AuctionStatus status);

    @Query("SELECT a.category, COUNT(a) FROM Auction a GROUP BY a.category")
    List<Object[]> countAuctionsByCategory();
} 