package com.auction.service.impl;

import com.auction.model.Auction;
import com.auction.model.AuctionStatus;
import com.auction.model.Bid;
import com.auction.model.User;
import com.auction.model.ItemCondition;
import com.auction.repository.BidRepository;
import com.auction.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

import com.auction.dto.AuctionResponse;
import com.auction.dto.UserDTO;
import com.auction.dto.BidDTO;
import com.auction.model.AuctionImage;

@Service
@RequiredArgsConstructor
public class BidServiceImpl implements BidService {
    private final BidRepository bidRepository;
    private final AuctionService auctionService;
    private final UserService userService;
    private final WebSocketService webSocketService;
    private final NotificationService notificationService;
    @Autowired
    private ObjectMapper objectMapper;

    @Override
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
        System.out.println("[BidServiceImpl] Before updateAuction: currentPrice=" + auction.getCurrentPrice());
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

        // Nếu auction đã kết thúc, set winner
        if (auction.getStatus() == AuctionStatus.ENDED) {
            auction.setWinner(savedBid.getBidder());
        }

        // Lấy lại auction mới nhất (bao gồm bid mới và winner)
        Auction updatedAuction = auctionService.getAuctionById(auctionId);
        System.out.println("[BidServiceImpl] After updateAuction: currentPrice=" + updatedAuction.getCurrentPrice());
        AuctionResponse auctionResponse = mapToAuctionResponse(updatedAuction);
        // Log dữ liệu realtime gửi qua WebSocket
        try {
            String json = objectMapper.writeValueAsString(auctionResponse);
            System.out.println("[BidServiceImpl] sendAuctionUpdate payload: " + json);
        } catch (Exception e) {
            System.out.println("[BidServiceImpl] Error serializing AuctionResponse: " + e.getMessage());
        }
        webSocketService.sendAuctionUpdate(auction.getId(), auctionResponse);

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

    @Override
    @Transactional(readOnly = true)
    public Page<Bid> getBidsByAuction(Long auctionId, Pageable pageable) {
        Auction auction = auctionService.getAuctionById(auctionId);
        return bidRepository.findByAuction(auction, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Bid> getBidsByUser(Long userId, Pageable pageable) {
        User user = userService.getUserById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return bidRepository.findByBidder(user, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Bid> getWinningBid(Long auctionId) {
        Auction auction = auctionService.getAuctionById(auctionId);
        return bidRepository.findWinningBid(auction);
    }

    private AuctionResponse mapToAuctionResponse(Auction auction) {
        AuctionResponse response = new AuctionResponse();
        response.setId(auction.getId());
        response.setTitle(auction.getTitle());
        response.setDescription(auction.getDescription());
        response.setStartingPrice(auction.getStartingPrice());
        response.setCurrentPrice(auction.getCurrentPrice());
        response.setStartTime(auction.getStartTime());
        response.setEndTime(auction.getEndTime());
        response.setStatus(auction.getStatus());
        if (auction.getSeller() != null) {
            UserDTO sellerDTO = new UserDTO();
            sellerDTO.setId(auction.getSeller().getId());
            sellerDTO.setUsername(auction.getSeller().getUsername());
            sellerDTO.setEmail(auction.getSeller().getEmail());
            response.setSeller(sellerDTO);
        }
        // Winner động: lấy bid cao nhất, nếu không có thì set null rõ ràng
        bidRepository.findTopByAuctionOrderByAmountDesc(auction).ifPresentOrElse(bid -> {
            UserDTO winnerDTO = new UserDTO();
            winnerDTO.setId(bid.getBidder().getId());
            winnerDTO.setUsername(bid.getBidder().getUsername());
            winnerDTO.setEmail(bid.getBidder().getEmail());
            response.setWinner(winnerDTO);
        }, () -> response.setWinner(null));
        if (auction.getBids() != null) {
            response.setBids(
                auction.getBids().stream()
                    .map(bid -> {
                        BidDTO dto = new BidDTO();
                        dto.setId(bid.getId());
                        dto.setAuctionId(bid.getAuction().getId());
                        dto.setBidderId(bid.getBidder().getId());
                        dto.setAmount(bid.getAmount());
                        dto.setBidTime(bid.getBidTime());
                        dto.setUsername(bid.getBidder().getUsername());
                        // Log từng bid mapping
                        System.out.println("[mapToAuctionResponse] BidDTO: id=" + dto.getId() + ", bidderId=" + dto.getBidderId() + ", username=" + dto.getUsername());
                        return dto;
                    }).toList()
            );
        }
        response.setCategory(auction.getCategory());
        response.setCondition(auction.getCondition());
        response.setViewCount(auction.getViewCount());
        response.setMinimumBidIncrement(auction.getMinimumBidIncrement());
        response.setImages(
            auction.getImages() != null
                ? auction.getImages().stream().map(this::mapToAuctionImageDTO).toList()
                : null
        );
        return response;
    }

    private com.auction.dto.AuctionImageDTO mapToAuctionImageDTO(AuctionImage image) {
        com.auction.dto.AuctionImageDTO dto = new com.auction.dto.AuctionImageDTO();
        dto.setId(image.getId());
        dto.setImageUrl(image.getUrl());
        dto.setDescription(null); // Nếu có trường description thì set, không thì để null
        dto.setUploadedAt(image.getCreatedAt());
        dto.setAuctionId(image.getAuction() != null ? image.getAuction().getId() : null);
        return dto;
    }
} 