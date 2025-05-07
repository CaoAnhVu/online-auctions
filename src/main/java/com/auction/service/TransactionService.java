package com.auction.service;

import com.auction.model.Transaction;
import com.auction.model.User;
import com.auction.enums.PaymentStatus;

import java.util.List;
import java.util.Optional;

public interface TransactionService {
    Transaction createTransaction(Long auctionId, User buyer, String bankInfo);
    Optional<Transaction> getTransactionById(Long id);
    Optional<Transaction> getTransactionByRef(String transactionRef);
    List<Transaction> getUserTransactions(User user);
    List<Transaction> getAuctionTransactions(Long auctionId);
    List<Transaction> getTransactionsByStatus(PaymentStatus status);
    Transaction updatePaymentStatus(Long transactionId, PaymentStatus status);
    Transaction updateTransaction(Transaction transaction);
    byte[] generateQRCode(Transaction transaction);
    void checkAndUpdateExpiredTransactions();
    void deleteTransaction(Long id);
} 