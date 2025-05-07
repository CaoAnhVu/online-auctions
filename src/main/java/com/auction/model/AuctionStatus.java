package com.auction.model;

public enum AuctionStatus {
    DRAFT,        // Auction is created but not published
    PENDING,      // Waiting for admin approval
    ACTIVE,       // Auction is live and accepting bids
    ENDED,        // Auction has ended normally
    CANCELLED,    // Auction was cancelled
    COMPLETED,    // Auction ended and payment processed
    SUSPENDED     // Temporarily suspended by admin
} 