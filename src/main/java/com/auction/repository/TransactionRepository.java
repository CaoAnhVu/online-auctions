package com.auction.repository;

import com.auction.model.Transaction;
import com.auction.model.User;
import com.auction.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTransactionRef(String transactionRef);
    List<Transaction> findByAuctionId(Long auctionId);
    List<Transaction> findByStatus(PaymentStatus status);
    List<Transaction> findByBuyer(User buyer);
    boolean existsByTransactionRef(String transactionRef);
} 