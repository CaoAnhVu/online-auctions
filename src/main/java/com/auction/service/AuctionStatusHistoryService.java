package com.auction.service;

import com.auction.model.Auction;
import com.auction.model.AuctionStatus;
import com.auction.model.AuctionStatusHistory;
import java.util.List;

public interface AuctionStatusHistoryService {
    void logStatusChange(Auction auction, AuctionStatus oldStatus, AuctionStatus newStatus, String changedBy);
    List<AuctionStatusHistory> getHistoryForAuction(Auction auction);
} 