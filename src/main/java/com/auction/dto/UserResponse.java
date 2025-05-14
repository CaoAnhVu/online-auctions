package com.auction.dto;

import lombok.Data;
import java.util.Set;

@Data
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Set<String> roles;
    private boolean isBlocked;
} 