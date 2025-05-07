package com.auction.repository;

import com.auction.model.Notification;
import com.auction.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);
    Page<Notification> findByRecipientAndReadFalseOrderByCreatedAtDesc(User recipient, Pageable pageable);
    List<Notification> findByRecipient(User recipient);
    void deleteByRecipient(User recipient);
    
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient.id = :userId")
    void markAllAsRead(Long userId);
} 