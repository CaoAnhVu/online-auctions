package com.auction.payment.model;

import com.auction.model.Auction;
import com.auction.model.User;
import com.auction.payment.enums.PaymentMethod;
import com.auction.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payment_orders")
public class PaymentOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id")
    private Auction auction;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column
    private String bankInfo;

    @Column
    private String qrCodeUrl;

    @Column
    private String transferContent;

    @Column
    private String paymentUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column
    private LocalDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        expiresAt = createdAt.plusMinutes(15); // Default expiration time of 15 minutes
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getAuctionId() {
        return auction != null ? auction.getId() : null;
    }

    public Long getBuyerId() {
        return user != null ? user.getId() : null;
    }
} 