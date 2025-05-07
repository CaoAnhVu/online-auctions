package com.auction.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;

    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @NotBlank
    @Size(min = 3, max = 50)
    private String fullName;

    @NotBlank
    @Email
    @Size(max = 50)
    private String email;

    @Size(max = 15)
    private String phoneNumber;

    @Size(max = 120)
    private String address;

    private Set<String> roles;
    private String status;
    private String avatarUrl;
} 