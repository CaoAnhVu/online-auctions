package com.auction.service;

import com.auction.model.NotificationTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface NotificationTemplateService {
    NotificationTemplate createTemplate(NotificationTemplate template);
    NotificationTemplate updateTemplate(Long id, NotificationTemplate template);
    void deleteTemplate(Long id);
    NotificationTemplate getTemplate(Long id);
    NotificationTemplate getTemplateByType(String type);
    List<NotificationTemplate> getAllTemplates();
    Page<NotificationTemplate> getTemplates(Pageable pageable);
    String processTemplate(String template, Map<String, Object> variables);
} 