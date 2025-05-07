package com.auction.service.impl;

import com.auction.model.Transaction;
import com.auction.model.User;
import com.auction.enums.PaymentStatus;
import com.auction.repository.TransactionRepository;
import com.auction.service.TransactionService;
import com.auction.utils.QRCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final QRCodeGenerator qrCodeGenerator;

    @Override
    public Transaction createTransaction(Long auctionId, User buyer, String bankInfo) {
        log.info("Creating new transaction for auction: {} and buyer: {}", auctionId, buyer.getUsername());
        Transaction transaction = new Transaction();
        transaction.setAuctionId(auctionId);
        transaction.setBuyer(buyer);
        transaction.setBankInfo(bankInfo);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setStatus(PaymentStatus.PENDING);
        return transactionRepository.save(transaction);
    }

    @Override
    public Optional<Transaction> getTransactionById(Long id) {
        log.info("Retrieving transaction with ID: {}", id);
        return transactionRepository.findById(id);
    }

    @Override
    public Optional<Transaction> getTransactionByRef(String transactionRef) {
        log.info("Retrieving transaction with ref: {}", transactionRef);
        return transactionRepository.findByTransactionRef(transactionRef);
    }

    @Override
    public List<Transaction> getUserTransactions(User user) {
        log.info("Retrieving transactions for user: {}", user.getUsername());
        return transactionRepository.findByBuyer(user);
    }

    @Override
    public List<Transaction> getAuctionTransactions(Long auctionId) {
        log.info("Retrieving transactions for auction: {}", auctionId);
        return transactionRepository.findByAuctionId(auctionId);
    }

    @Override
    public List<Transaction> getTransactionsByStatus(PaymentStatus status) {
        log.info("Retrieving transactions with status: {}", status);
        return transactionRepository.findByStatus(status);
    }

    @Override
    public Transaction updatePaymentStatus(Long transactionId, PaymentStatus status) {
        log.info("Updating payment status for transaction: {} to: {}", transactionId, status);
        Transaction transaction = getTransactionById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + transactionId));
        transaction.setStatus(status);
        transaction.setUpdatedAt(LocalDateTime.now());
        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction updateTransaction(Transaction transaction) {
        log.info("Updating transaction: {}", transaction.getId());
        return transactionRepository.save(transaction);
    }

    @Override
    public byte[] generateQRCode(Transaction transaction) {
        log.info("Generating QR code for transaction: {}", transaction.getId());
        String qrContent = String.format("Transaction ID: %d\nAmount: %d\nBank Info: %s",
                transaction.getId(), transaction.getAmount(), transaction.getBankInfo());
        return qrCodeGenerator.generateQRCode(qrContent);
    }

    @Override
    public void checkAndUpdateExpiredTransactions() {
        log.info("Checking for expired transactions");
        List<Transaction> pendingTransactions = transactionRepository.findByStatus(PaymentStatus.PENDING);
        LocalDateTime expirationThreshold = LocalDateTime.now().minusHours(24);
        
        pendingTransactions.stream()
                .filter(transaction -> transaction.getCreatedAt().isBefore(expirationThreshold))
                .forEach(transaction -> {
                    transaction.setStatus(PaymentStatus.EXPIRED);
                    transaction.setUpdatedAt(LocalDateTime.now());
                    transactionRepository.save(transaction);
                    log.info("Transaction {} marked as expired", transaction.getId());
                });
    }

    @Override
    public void deleteTransaction(Long id) {
        log.info("Deleting transaction with ID: {}", id);
        transactionRepository.deleteById(id);
    }
} 