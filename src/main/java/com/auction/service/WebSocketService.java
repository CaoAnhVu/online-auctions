package com.auction.service;

import com.auction.dto.AuctionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;

@Service
@RequiredArgsConstructor
public class WebSocketService {
    private final SimpMessagingTemplate messagingTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    public void sendAuctionUpdate(Long auctionId, AuctionResponse auctionResponse) {
        try {
            String json = objectMapper.writeValueAsString(auctionResponse);
            System.out.println("[WebSocket] Broadcast auction " + auctionId + ": " + json);
        } catch (Exception e) {
            System.out.println("[WebSocket] Error serializing AuctionResponse: " + e.getMessage());
        }
        // Gửi update cho tất cả client đang xem auction này
        messagingTemplate.convertAndSend("/topic/auctions/" + auctionId, auctionResponse);
        
        // Gửi update cho tất cả client đang xem danh sách auctions
        messagingTemplate.convertAndSend("/topic/auctions", auctionResponse);
    }
}
