package com.auction.model;

import com.auction.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "auction_id", nullable = false)
    private Long auctionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id")
    private User buyer;

    @Column(name = "transaction_ref", unique = true, nullable = false)
    private String transactionRef;

    @Column(nullable = false)
    private Long amount;

    @Column(name = "bank_info")
    private String bankInfo;

    @Column(name = "bank_code")
    private String bankCode;

    @Column(name = "bank_transaction_no")
    private String bankTransactionNo;

    @Column(name = "card_type")
    private String cardType;

    @Column(name = "order_info")
    private String orderInfo;

    @Column(name = "payment_date")
    private String paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 