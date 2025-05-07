package com.auction.controller;

import com.auction.model.NotificationTemplate;
import com.auction.service.NotificationTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notification-templates")
@PreAuthorize("hasRole('ADMIN')")
public class NotificationTemplateController {

    private final NotificationTemplateService templateService;

    @Autowired
    public NotificationTemplateController(NotificationTemplateService templateService) {
        this.templateService = templateService;
    }

    @PostMapping
    public ResponseEntity<NotificationTemplate> createTemplate(@RequestBody NotificationTemplate template) {
        return ResponseEntity.ok(templateService.createTemplate(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationTemplate> updateTemplate(
            @PathVariable Long id,
            @RequestBody NotificationTemplate template) {
        return ResponseEntity.ok(templateService.updateTemplate(id, template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationTemplate> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.getTemplate(id));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<NotificationTemplate> getTemplateByType(@PathVariable String type) {
        return ResponseEntity.ok(templateService.getTemplateByType(type));
    }

    @GetMapping
    public ResponseEntity<List<NotificationTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<NotificationTemplate>> getTemplates(Pageable pageable) {
        return ResponseEntity.ok(templateService.getTemplates(pageable));
    }

    @PostMapping("/process")
    public ResponseEntity<String> processTemplate(
            @RequestParam String template,
            @RequestBody Map<String, Object> variables) {
        return ResponseEntity.ok(templateService.processTemplate(template, variables));
    }
} 