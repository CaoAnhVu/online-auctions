package com.auction.controller;

import com.auction.dto.*;
import com.auction.model.*;
import com.auction.service.*;
import com.auction.payment.model.PaymentOrder;
import com.auction.payment.repository.PaymentOrderRepository;
import com.auction.enums.PaymentStatus;
import com.auction.payment.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AuctionService auctionService;
    private final PaymentOrderRepository paymentOrderRepository;
    private final AdminStatsService adminStatsService;
    private final AuctionStatusHistoryService auctionStatusHistoryService;

    // 1. Thống kê hệ thống
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats(@RequestParam String range) {
        AdminStatsResponse stats = adminStatsService.getStats(range);
        return ResponseEntity.ok(stats);
    }

    // 2. Quản lý người dùng
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> dtos = users.stream().map(this::mapToUserResponse).toList();
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        User user = userService.updateUser(id, updatedUser);
        return ResponseEntity.ok(mapToUserResponse(user));
    }

    @PostMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id) {
        userService.blockUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{id}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long id) {
        userService.unblockUser(id);
        return ResponseEntity.ok().build();
    }

    // 3. Quản lý đấu giá
    @GetMapping("/auctions")
    public ResponseEntity<List<AuctionResponse>> getAllAuctions() {
        List<Auction> auctions = auctionService.getAllAuctions();
        List<AuctionResponse> dtos = auctions.stream().map(this::mapToAuctionResponse).toList();
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/auctions/{id}")
    public ResponseEntity<AuctionResponse> updateAuction(@PathVariable Long id, @RequestBody Auction updatedAuction) {
        Auction auction = auctionService.updateAuction(id, updatedAuction);
        return ResponseEntity.ok(mapToAuctionResponse(auction));
    }

    @DeleteMapping("/auctions/{id}")
    public ResponseEntity<?> deleteAuction(@PathVariable Long id) {
        auctionService.deleteAuction(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/auctions/{id}/status")
    public ResponseEntity<AuctionResponse> updateAuctionStatus(@PathVariable Long id, @RequestParam AuctionStatus status) {
        auctionService.updateAuctionStatus(id, status);
        Auction auction = auctionService.getAuctionById(id);
        return ResponseEntity.ok(mapToAuctionResponse(auction));
    }

    @GetMapping("/auctions/{id}/status-history")
    public ResponseEntity<List<AuctionStatusHistory>> getAuctionStatusHistory(@PathVariable Long id) {
        Auction auction = auctionService.getAuctionById(id);
        List<AuctionStatusHistory> history = auctionStatusHistoryService.getHistoryForAuction(auction);
        return ResponseEntity.ok(history);
    }

    // 4. Quản lý thanh toán
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        List<PaymentOrder> payments = paymentOrderRepository.findAll();
        List<PaymentResponse> dtos = payments.stream().map(this::mapToPaymentResponse).toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/payments/{id}/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(@PathVariable Long id) {
        PaymentOrder payment = paymentOrderRepository.findById(id).orElse(null);
        return ResponseEntity.ok(mapToPaymentResponse(payment));
    }

    // --- Helper mapping methods ---
    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRoles(user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()));
        response.setBlocked(Boolean.TRUE.equals(user.getBlocked()));
        return response;
    }

    private AuctionResponse mapToAuctionResponse(Auction auction) {
        AuctionResponse response = new AuctionResponse();
        response.setId(auction.getId());
        response.setTitle(auction.getTitle());
        response.setDescription(auction.getDescription());
        response.setStartingPrice(auction.getStartingPrice());
        response.setCurrentPrice(auction.getCurrentPrice());
        response.setMinimumBidIncrement(auction.getMinimumBidIncrement());
        response.setStartTime(auction.getStartTime());
        response.setEndTime(auction.getEndTime());
        response.setStatus(auction.getStatus());
        response.setCategory(auction.getCategory());
        response.setCondition(auction.getCondition());
        response.setViewCount(auction.getViewCount() != null ? auction.getViewCount() : 0);
        response.setBidCount(auction.getBids() != null ? auction.getBids().size() : 0);
        response.setSellerId(auction.getSeller() != null ? auction.getSeller().getId() : null);
        response.setWinnerId(null);
        // Seller mapping
        if (auction.getSeller() != null) {
            UserDTO sellerDTO = new UserDTO();
            sellerDTO.setId(auction.getSeller().getId());
            sellerDTO.setUsername(auction.getSeller().getUsername());
            sellerDTO.setEmail(auction.getSeller().getEmail());
            response.setSeller(sellerDTO);
        }
        response.setWinner(null);
        response.setImages(
            auction.getImages() != null
                ? auction.getImages().stream().map(img -> {
                    AuctionImageDTO dto = new AuctionImageDTO();
                    dto.setId(img.getId());
                    dto.setImageUrl(img.getUrl());
                    dto.setUploadedAt(img.getCreatedAt());
                    dto.setAuctionId(img.getAuction() != null ? img.getAuction().getId() : null);
                    return dto;
                }).toList()
                : null
        );
        response.setCreatedAt(auction.getCreatedAt());
        response.setUpdatedAt(auction.getUpdatedAt());
        response.setActive(auction.getStatus() == AuctionStatus.ACTIVE);
        response.setEnded(auction.getStatus() == AuctionStatus.ENDED);
        response.setCancelled(auction.getStatus() == AuctionStatus.CANCELLED);
        return response;
    }

    private PaymentResponse mapToPaymentResponse(PaymentOrder payment) {
        PaymentResponse response = new PaymentResponse();
        response.setStatus(payment.getStatus());
        response.setAmount(payment.getAmount());
        response.setOrderCode(payment.getOrderCode());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setPaymentUrl(payment.getPaymentUrl());
        response.setExpiresAt(payment.getExpiresAt());
        return response;
    }
}