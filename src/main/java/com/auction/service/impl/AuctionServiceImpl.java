package com.auction.service.impl;

import com.auction.model.Auction;
import com.auction.model.AuctionStatus;
import com.auction.repository.AuctionRepository;
import com.auction.service.AuctionService;
import com.auction.service.AuctionStatusHistoryService;
import com.auction.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionServiceImpl implements AuctionService {
    private final AuctionRepository auctionRepository;
    private final UserService userService;
    private final AuctionStatusHistoryService auctionStatusHistoryService;

    @Override
    @Transactional
    public Auction createAuction(Auction auction, Long sellerId) {
        var seller = userService.getUserById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
        auction.setSeller(seller);
        auction.setStatus(AuctionStatus.PENDING);
        auction.setCurrentPrice(auction.getStartingPrice());
        auction.setViewCount(0);
        return auctionRepository.save(auction);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Auction> getAllAuctions(Pageable pageable) {
        return auctionRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Auction getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        if (auction.getStatus() == AuctionStatus.ACTIVE && auction.getEndTime() != null && auction.getEndTime().isBefore(java.time.LocalDateTime.now())) {
            auction.setStatus(AuctionStatus.ENDED);
            auctionRepository.save(auction);
        }
        return auction;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Auction> searchAuctions(String keyword, String category, Double minPrice, Double maxPrice, AuctionStatus status, Pageable pageable) {
        return auctionRepository.searchAuctions(keyword, category, minPrice, maxPrice, status, pageable);
    }

    @Override
    @Transactional
    public Auction updateAuction(Long id, Auction updatedAuction) {
        Auction auction = getAuctionById(id);
        if (updatedAuction.getTitle() != null) {
            auction.setTitle(updatedAuction.getTitle());
        }
        if (updatedAuction.getDescription() != null) {
            auction.setDescription(updatedAuction.getDescription());
        }
        if (updatedAuction.getCategory() != null) {
            auction.setCategory(updatedAuction.getCategory());
        }
        if (updatedAuction.getCondition() != null) {
            auction.setCondition(updatedAuction.getCondition());
        }
        if (updatedAuction.getMinimumBidIncrement() != null) {
            auction.setMinimumBidIncrement(updatedAuction.getMinimumBidIncrement());
        }
        return auctionRepository.save(auction);
    }

    @Override
    @Transactional
    public void deleteAuction(Long id) {
        Auction auction = getAuctionById(id);
        auctionRepository.delete(auction);
    }

    @Override
    @Transactional
    public void incrementViewCount(Long id) {
        Auction auction = getAuctionById(id);
        auction.setViewCount(auction.getViewCount() + 1);
        auctionRepository.save(auction);
    }

    @Override
    @Transactional
    public void updateAuctionStatus(Long id, AuctionStatus status) {
        Auction auction = getAuctionById(id);
        AuctionStatus oldStatus = auction.getStatus();
        auction.setStatus(status);
        auctionRepository.save(auction);
        auctionStatusHistoryService.logStatusChange(auction, oldStatus, status, "admin"); 
    }

    @Override
    @Transactional
    public void processEndedAuctions() {
        LocalDateTime now = LocalDateTime.now();
        List<Auction> endedAuctions = auctionRepository.findEndedAuctions(now);
        for (Auction auction : endedAuctions) {
            auction.setStatus(AuctionStatus.ENDED);
            auctionRepository.save(auction);
        }
    }

    @Override
    @Transactional
    public void startPendingAuctions() {
        LocalDateTime now = LocalDateTime.now();
        List<Auction> auctionsToStart = auctionRepository.findAuctionsToStart(now);
        for (Auction auction : auctionsToStart) {
            auction.setStatus(AuctionStatus.ACTIVE);
            auctionRepository.save(auction);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Auction> getAuctionsBySeller(Long sellerId) {
        var seller = userService.getUserById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        return auctionRepository.findBySeller(seller, Pageable.unpaged()).getContent();
    }

    @Override
    public List<Auction> searchAuctions(String keyword) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public List<Auction> getAuctionsByCategory(String category) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public List<Auction> getAuctionsByStatus(AuctionStatus status) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public void startAuction(Long id) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public void endAuction(Long id) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public void cancelAuction(Long id) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public void updateCurrentPrice(Long id, BigDecimal newPrice) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public boolean isValidBidAmount(Long id, BigDecimal bidAmount) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public void addAuctionImage(Long id, String imageUrl) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public void removeAuctionImage(Long id, String imageUrl) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public List<String> getAuctionImages(Long id) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public int getTotalActiveAuctions() {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public BigDecimal getHighestBidForAuction(Long id) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public int getTotalBidsForAuction(Long id) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Override
    public void checkAndUpdateExpiredAuctions() {
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Scheduled(fixedRate = 60000) // Chạy mỗi 60 giây
    public void scheduledProcessEndedAuctions() {
        processEndedAuctions();
    }
}
