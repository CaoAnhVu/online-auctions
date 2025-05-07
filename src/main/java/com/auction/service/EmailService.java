package com.auction.service;

public interface EmailService {
    void sendEmail(String to, String subject, String content);
    void sendHtmlEmail(String to, String subject, String htmlContent);
} 