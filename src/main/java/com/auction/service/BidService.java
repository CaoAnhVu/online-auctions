package com.auction.service;

import com.auction.model.Auction;
import com.auction.model.AuctionStatus;
import com.auction.model.Bid;
import com.auction.model.User;
import com.auction.repository.BidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BidService {
    private final BidRepository bidRepository;
    private final AuctionService auctionService;
    private final UserService userService;
    private final WebSocketService webSocketService;
    private final NotificationService notificationService;

    @Transactional
    public Bid placeBid(Long auctionId, Long userId, BigDecimal amount) {
        Auction auction = auctionService.getAuctionById(auctionId);
        User bidder = userService.getUserById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Validate bid
        validateBid(auction, bidder, amount);

        // Create new bid
        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setAmount(amount);

        // Update auction current price
        auction.setCurrentPrice(amount);
        auctionService.updateAuction(auctionId, auction);

        // Update previous winning bid
        Optional<Bid> previousWinningBid = bidRepository.findWinningBid(auction);
        previousWinningBid.ifPresent(winningBid -> {
            winningBid.setWinning(false);
            bidRepository.save(winningBid);
        });

        // Save new bid as winning
        bid.setWinning(true);
        Bid savedBid = bidRepository.save(bid);

        // Gửi realtime update cho tất cả client đang xem auction này
        webSocketService.sendAuctionUpdate(auction.getId(), savedBid);

        // Gửi notification cho seller
        notificationService.createAndSendNotification(
            auction.getSeller(),
            "Có người vừa đặt giá mới cho sản phẩm của bạn!",
            "/auctions/" + auction.getId()
        );

        // Gửi notification cho người bị vượt giá
        previousWinningBid.ifPresent(winningBid -> {
            notificationService.createAndSendNotification(
                winningBid.getBidder(),
                "Bạn vừa bị vượt giá ở phiên đấu giá #" + auction.getId(),
                "/auctions/" + auction.getId()
            );
        });

        // Gửi notification cho người đặt giá mới
        notificationService.createAndSendNotification(
            bidder,
            "Bạn đã đặt giá thành công!",
            "/auctions/" + auction.getId()
        );

        return savedBid;
    }

    private void validateBid(Auction auction, User bidder, BigDecimal amount) {
        // Check if auction is active
        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new RuntimeException("Auction is not active");
        }

        // Check if bidder is not the seller
        if (bidder.getId().equals(auction.getSeller().getId())) {
            throw new RuntimeException("Seller cannot bid on their own auction");
        }

        // Check if bid amount is higher than current price
        if (amount.compareTo(auction.getCurrentPrice()) <= 0) {
            throw new RuntimeException("Bid amount must be higher than current price");
        }

        // Check if bid amount meets minimum increment
        BigDecimal minimumBid = auction.getCurrentPrice().add(auction.getMinimumBidIncrement());
        if (amount.compareTo(minimumBid) < 0) {
            throw new RuntimeException("Bid amount must be at least " + minimumBid);
        }
    }

    @Transactional(readOnly = true)
    public Page<Bid> getBidsByAuction(Long auctionId, Pageable pageable) {
        Auction auction = auctionService.getAuctionById(auctionId);
        return bidRepository.findByAuction(auction, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Bid> getBidsByUser(Long userId, Pageable pageable) {
        User user = userService.getUserById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return bidRepository.findByBidder(user, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Bid> getWinningBid(Long auctionId) {
        Auction auction = auctionService.getAuctionById(auctionId);
        return bidRepository.findWinningBid(auction);
    }
} 