package com.auction.config;

import com.auction.model.ERole;
import com.auction.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final RoleService roleService;

    @Override
    public void run(String... args) {
        // Initialize default roles if they don't exist
        for (ERole role : ERole.values()) {
            if (!roleService.existsByName(role)) {
                roleService.createRole(role);
            }
        }
    }
} 