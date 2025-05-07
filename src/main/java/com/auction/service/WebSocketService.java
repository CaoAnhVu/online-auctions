package com.auction.service;

import com.auction.model.Auction;
import com.auction.model.Bid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketService {
    private final SimpMessagingTemplate messagingTemplate;

    public void sendAuctionUpdate(Long auctionId, Bid bid) {
        // Gửi update cho tất cả client đang xem auction này
        messagingTemplate.convertAndSend("/topic/auctions/" + auctionId, bid);
        
        // Gửi update cho tất cả client đang xem danh sách auctions
        messagingTemplate.convertAndSend("/topic/auctions", bid);
    }
}
