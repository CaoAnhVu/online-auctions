package com.auction.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "notification_templates")
public class NotificationTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type", unique = true)
    private String type;

    @Column(name = "title")
    private String title;

    @Column(name = "template")
    private String template;

    @Column(name = "icon")
    private String icon;

    @Column(name = "email_subject")
    private String emailSubject;

    @Column(name = "email_template")
    private String emailTemplate;

    @Column(name = "subject")
    private String subject;

    @Column(name = "body")
    private String body;
} 