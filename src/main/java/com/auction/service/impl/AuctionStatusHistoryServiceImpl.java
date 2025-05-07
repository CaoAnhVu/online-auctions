package com.auction.service.impl;

import com.auction.model.Auction;
import com.auction.model.AuctionStatus;
import com.auction.model.AuctionStatusHistory;
import com.auction.repository.AuctionStatusHistoryRepository;
import com.auction.service.AuctionStatusHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionStatusHistoryServiceImpl implements AuctionStatusHistoryService {
    private final AuctionStatusHistoryRepository historyRepository;

    @Override
    public void logStatusChange(Auction auction, AuctionStatus oldStatus, AuctionStatus newStatus, String changedBy) {
        AuctionStatusHistory history = new AuctionStatusHistory();
        history.setAuction(auction);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedBy(changedBy);
        historyRepository.save(history);
    }

    @Override
    public List<AuctionStatusHistory> getHistoryForAuction(Auction auction) {
        return historyRepository.findByAuctionOrderByChangedAtDesc(auction);
    }
} 