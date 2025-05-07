package com.auction.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "type")
    private String type;

    @Column(name = "email_enabled")
    private boolean emailEnabled;

    @Column(name = "in_app_enabled")
    private boolean inAppEnabled;

    @Column(name = "push_enabled")
    private boolean pushEnabled;
} 