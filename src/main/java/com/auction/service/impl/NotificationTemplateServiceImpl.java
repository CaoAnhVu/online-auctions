package com.auction.service.impl;

import com.auction.model.NotificationTemplate;
import com.auction.repository.NotificationTemplateRepository;
import com.auction.service.NotificationTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class NotificationTemplateServiceImpl implements NotificationTemplateService {

    private final NotificationTemplateRepository templateRepository;
    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\$\\{([^}]+)\\}");

    @Autowired
    public NotificationTemplateServiceImpl(NotificationTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @Override
    @Transactional
    public NotificationTemplate createTemplate(NotificationTemplate template) {
        return templateRepository.save(template);
    }

    @Override
    @Transactional
    public NotificationTemplate updateTemplate(Long id, NotificationTemplate template) {
        return templateRepository.findById(id)
                .map(existingTemplate -> {
                    existingTemplate.setType(template.getType());
                    existingTemplate.setTitle(template.getTitle());
                    existingTemplate.setTemplate(template.getTemplate());
                    existingTemplate.setIcon(template.getIcon());
                    existingTemplate.setEmailSubject(template.getEmailSubject());
                    existingTemplate.setEmailTemplate(template.getEmailTemplate());
                    return templateRepository.save(existingTemplate);
                })
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }

    @Override
    @Transactional
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }

    @Override
    public NotificationTemplate getTemplate(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }

    @Override
    public NotificationTemplate getTemplateByType(String type) {
        return templateRepository.findByType(type)
                .orElseThrow(() -> new RuntimeException("Template not found for type: " + type));
    }

    @Override
    public List<NotificationTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    @Override
    public Page<NotificationTemplate> getTemplates(Pageable pageable) {
        return templateRepository.findAll(pageable);
    }

    @Override
    public String processTemplate(String template, Map<String, Object> variables) {
        if (template == null || variables == null) {
            return template;
        }

        StringBuffer result = new StringBuffer();
        Matcher matcher = VARIABLE_PATTERN.matcher(template);

        while (matcher.find()) {
            String variableName = matcher.group(1);
            Object value = variables.get(variableName);
            String replacement = value != null ? value.toString() : "";
            matcher.appendReplacement(result, replacement);
        }
        matcher.appendTail(result);

        return result.toString();
    }
} 