package com.auction.repository;

import com.auction.model.NotificationPreference;
import com.auction.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByUserAndType(User user, String type);
    List<NotificationPreference> findByUser(User user);
} 