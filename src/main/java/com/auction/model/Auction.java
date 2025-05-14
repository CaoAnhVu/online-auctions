package com.auction.model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "auctions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(name = "starting_price", nullable = false)
    private BigDecimal startingPrice;

    @Column(name = "current_price", nullable = false)
    private BigDecimal currentPrice;

    @Column(name = "minimum_bid_increment", nullable = false)
    private BigDecimal minimumBidIncrement;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winning_bid_id")
    private Bid winningBid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionStatus status = AuctionStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_condition", nullable = false)
    private ItemCondition condition;

    @Column
    private String category;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "featured")
    private Boolean featured = false;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Bid> bids = new ArrayList<>();

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AuctionImage> images = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (currentPrice == null) {
            currentPrice = startingPrice;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 