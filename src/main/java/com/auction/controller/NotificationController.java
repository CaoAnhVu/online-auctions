package com.auction.controller;

import com.auction.model.Notification;
import com.auction.model.NotificationPreference;
import com.auction.model.User;
import com.auction.service.NotificationService;
import com.auction.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @Autowired
    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<Page<Notification>> getUserNotifications(
            Authentication authentication,
            Pageable pageable) {
        System.out.println("Auth: " + authentication);
        User user = userService.getUserByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(notificationService.getUserNotifications(user, pageable));
    }

    @GetMapping("/unread")
    public ResponseEntity<Page<Notification>> getUnreadNotifications(
            Authentication authentication,
            Pageable pageable) {
        System.out.println("Auth: " + authentication);
        User user = userService.getUserByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(notificationService.getUnreadNotifications(user, pageable));
    }

    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<Notification>>> getGroupedNotifications(
            Authentication authentication) {
        System.out.println("Auth: " + authentication);
        User user = userService.getUserByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(notificationService.getGroupedNotifications(user));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        System.out.println("Auth: " + authentication);
        User user = userService.getUserByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAllNotifications(Authentication authentication) {
        System.out.println("Auth: " + authentication);
        User user = userService.getUserByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        notificationService.deleteAllUserNotifications(user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<List<NotificationPreference>> getNotificationPreferences(
            Authentication authentication) {
        System.out.println("Auth: " + authentication);
        User user = userService.getUserByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(notificationService.getUserNotificationPreferences(user));
    }

    @PutMapping("/preferences/{type}")
    public ResponseEntity<NotificationPreference> updateNotificationPreference(
            Authentication authentication,
            @PathVariable String type,
            @RequestParam boolean email,
            @RequestParam boolean inApp,
            @RequestParam boolean push) {
        System.out.println("Auth: " + authentication);
        User user = userService.getUserByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        NotificationPreference preference = notificationService.updateNotificationPreference(
            user, type, email, inApp, push);
        return ResponseEntity.ok(preference);
    }

    @MessageMapping("/notifications.acknowledge")
    public void acknowledgeNotification(@Payload Long notificationId) {
        notificationService.markAsRead(notificationId);
    }
} 