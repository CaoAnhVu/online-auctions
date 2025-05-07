package com.auction.service;

import com.auction.model.Notification;
import com.auction.model.NotificationPreference;
import com.auction.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface NotificationService {
    void createAndSendNotification(User recipient, String message, String link);
    
    Notification createNotification(User recipient, String message, String type);
    
    Page<Notification> getUserNotifications(User user, Pageable pageable);
    
    Page<Notification> getUnreadNotifications(User user, Pageable pageable);
    
    Map<String, List<Notification>> getGroupedNotifications(User user);
    
    void markAsRead(Long notificationId);
    
    void markAllAsRead(User user);
    
    void deleteNotification(Long notificationId);
    
    void deleteAllUserNotifications(User user);
    
    NotificationPreference getNotificationPreference(User user, String type);
    
    NotificationPreference updateNotificationPreference(User user, String type, 
        boolean emailEnabled, boolean inAppEnabled, boolean pushEnabled);
    
    List<NotificationPreference> getUserNotificationPreferences(User user);
    
    void sendEmailNotification(User recipient, String subject, String message);
    
    void sendInAppNotification(User recipient, String message);
    
    void sendPushNotification(User recipient, String message);
} 