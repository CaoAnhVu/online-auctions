package com.auction.service.impl;

import com.auction.model.Notification;
import com.auction.model.NotificationPreference;
import com.auction.model.User;
import com.auction.repository.NotificationPreferenceRepository;
import com.auction.repository.NotificationRepository;
import com.auction.service.EmailService;
import com.auction.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void createAndSendNotification(User recipient, String message, String link) {
        Notification notification = createNotification(recipient, message, "BID");
        
        // Gửi notification qua WebSocket
        messagingTemplate.convertAndSendToUser(
            recipient.getUsername(),
            "/queue/notifications",
            notification
        );
        
        // Gửi email nếu user đã bật email notification
        NotificationPreference preference = getNotificationPreference(recipient, "BID");
        if (preference != null && preference.isEmailEnabled()) {
            sendEmailNotification(recipient, "New Bid Notification", message);
        }
        
        // Gửi push notification nếu user đã bật push notification
        if (preference != null && preference.isPushEnabled()) {
            sendPushNotification(recipient, message);
        }
    }

    @Override
    @Transactional
    public Notification createNotification(User recipient, String message, String type) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(User user, Pageable pageable) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getUnreadNotifications(User user, Pageable pageable) {
        return notificationRepository.findByRecipientAndReadFalseOrderByCreatedAtDesc(user, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<Notification>> getGroupedNotifications(User user) {
        List<Notification> notifications = notificationRepository.findByRecipient(user);
        return notifications.stream()
            .collect(Collectors.groupingBy(Notification::getType));
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId)
            .ifPresent(notification -> {
                notification.setRead(true);
                notificationRepository.save(notification);
            });
    }

    @Override
    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsRead(user.getId());
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Override
    @Transactional
    public void deleteAllUserNotifications(User user) {
        notificationRepository.deleteByRecipient(user);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationPreference getNotificationPreference(User user, String type) {
        return preferenceRepository.findByUserAndType(user, type)
            .orElse(new NotificationPreference());
    }

    @Override
    @Transactional
    public NotificationPreference updateNotificationPreference(User user, String type, boolean email, boolean inApp, boolean push) {
        NotificationPreference preference = preferenceRepository.findByUserAndType(user, type)
            .orElse(new NotificationPreference());
            
        preference.setUser(user);
        preference.setType(type);
        preference.setEmailEnabled(email);
        preference.setInAppEnabled(inApp);
        preference.setPushEnabled(push);
        
        return preferenceRepository.save(preference);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationPreference> getUserNotificationPreferences(User user) {
        return preferenceRepository.findByUser(user);
    }

    @Override
    public void sendEmailNotification(User recipient, String subject, String message) {
        NotificationPreference preference = getNotificationPreference(recipient, "EMAIL");
        if (preference.isEmailEnabled()) {
            emailService.sendEmail(recipient.getEmail(), subject, message);
        }
    }

    @Override
    public void sendInAppNotification(User recipient, String message) {
        NotificationPreference preference = getNotificationPreference(recipient, "IN_APP");
        if (preference.isInAppEnabled()) {
            Notification notification = createNotification(recipient, message, "IN_APP");
            messagingTemplate.convertAndSendToUser(
                recipient.getUsername(),
                "/queue/notifications",
                notification
            );
        }
    }

    @Override
    public void sendPushNotification(User recipient, String message) {
        NotificationPreference preference = getNotificationPreference(recipient, "PUSH");
        if (preference.isPushEnabled()) {
            // Implementation for push notifications will be added later
            // This could integrate with Firebase Cloud Messaging or other push notification service
        }
    }
} 