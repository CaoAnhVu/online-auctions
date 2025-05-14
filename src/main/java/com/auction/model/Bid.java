package com.auction.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "bids")
public class Bid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bidder_id", nullable = false)
    private User bidder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDateTime bidTime;

    @Column(name = "is_winning")
    private boolean winning = false;

    @PrePersist
    protected void onCreate() {
        bidTime = LocalDateTime.now();
    }
} 