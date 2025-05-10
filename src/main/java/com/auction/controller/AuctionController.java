package com.auction.controller;

import com.auction.dto.AuctionRequest;
import com.auction.dto.AuctionResponse;
import com.auction.model.Auction;
import com.auction.model.AuctionStatus;
import com.auction.service.AuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.auction.model.AuctionImage;
import java.util.UUID;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

import java.util.List;
import com.auction.dto.UserDTO;
import com.auction.model.User;
import com.auction.dto.BidDTO;
import com.auction.repository.BidRepository;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {
    private final AuctionService auctionService;
    private final ObjectMapper objectMapper;
    private final BidRepository bidRepository;

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuctionResponse> createAuction(
            @RequestPart("auction") String auctionJson,
            @RequestPart(value = "images", required = false) MultipartFile[] images,
            org.springframework.security.core.Authentication authentication
    ) {
        System.out.println("auctionJson: " + auctionJson);
        AuctionRequest request;
        try {
            request = objectMapper.readValue(auctionJson, AuctionRequest.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid auction JSON", e);
        }

        Auction auction = mapToAuction(request);

        // Xử lý lưu ảnh
        if (images != null && images.length > 0) {
            List<AuctionImage> auctionImages = new ArrayList<>();
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            for (MultipartFile img : images) {
                try {
                    String fileName = UUID.randomUUID() + "_" + img.getOriginalFilename();
                    File dest = new File(uploadDir + fileName);
                    img.transferTo(dest);

                    AuctionImage auctionImage = AuctionImage.builder()
                            .fileName(fileName)
                            .fileType(img.getContentType())
                            .size(img.getSize())
                            .url("/uploads/" + fileName)
                            .auction(auction)
                            .build();

                    auctionImages.add(auctionImage);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to save image: " + img.getOriginalFilename(), e);
                }
            }
            auction.setImages(auctionImages);
        }

        // Lấy sellerId từ authentication
        Long sellerId = ((com.auction.security.UserPrincipal) authentication.getPrincipal()).getId();
        Auction createdAuction = auctionService.createAuction(auction, sellerId);
        return ResponseEntity.ok(mapToAuctionResponse(createdAuction));
    }

    @GetMapping
    public ResponseEntity<Page<AuctionResponse>> getAllAuctions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) AuctionStatus status,
            Pageable pageable) {
        Page<Auction> auctions = auctionService.searchAuctions(keyword, category, minPrice, maxPrice, status, pageable);
        return ResponseEntity.ok(auctions.map(this::mapToAuctionResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponse> getAuction(@PathVariable Long id) {
        Auction auction = auctionService.getAuctionById(id);
        auctionService.incrementViewCount(id);
        return ResponseEntity.ok(mapToAuctionResponse(auction));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @auctionService.isSeller(#id, authentication.principal.id)")
    public ResponseEntity<AuctionResponse> updateAuction(@PathVariable Long id, @RequestBody AuctionRequest request) {
        Auction auction = mapToAuction(request);
        Auction updatedAuction = auctionService.updateAuction(id, auction);
        return ResponseEntity.ok(mapToAuctionResponse(updatedAuction));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @auctionService.isSeller(#id, authentication.principal.id)")
    public ResponseEntity<Void> deleteAuction(@PathVariable Long id) {
        auctionService.deleteAuction(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuctionResponse> updateAuctionStatus(
            @PathVariable Long id,
            @RequestParam AuctionStatus status) {
        auctionService.updateAuctionStatus(id, status);
        Auction auction = auctionService.getAuctionById(id);
        return ResponseEntity.ok(mapToAuctionResponse(auction));
    }

    @GetMapping("/mine")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AuctionResponse>> getMyAuctions(org.springframework.security.core.Authentication authentication) {
        Long sellerId = ((com.auction.security.UserPrincipal) authentication.getPrincipal()).getId();
        List<Auction> myAuctions = auctionService.getAuctionsBySeller(sellerId);
        List<AuctionResponse> responses = myAuctions.stream()
            .map(this::mapToAuctionResponse)
            .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<AuctionResponse>> getFeaturedAuctions() {
        List<Auction> auctions = auctionService.getTopMostViewedActiveAuctions(6);
        List<AuctionResponse> responses = auctions.stream().map(this::mapToAuctionResponse).toList();
        return ResponseEntity.ok(responses);
    }

    private Auction mapToAuction(AuctionRequest request) {
        Auction auction = new Auction();
        auction.setTitle(request.getTitle());
        auction.setDescription(request.getDescription());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setMinimumBidIncrement(request.getMinimumBidIncrement());
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setCategory(request.getCategory());
        auction.setCondition(request.getCondition());
        return auction;
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