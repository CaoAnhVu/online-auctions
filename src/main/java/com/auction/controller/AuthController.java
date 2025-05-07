package com.auction.controller;

import com.auction.dto.LoginRequest;
import com.auction.dto.LoginResponse;
import com.auction.dto.UserResponse;
import com.auction.model.User;
import com.auction.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String token = authService.login(request.getUsername(), request.getPassword());
        User user = authService.getCurrentUser();
        
        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setUsername(user.getUsername());
        userResponse.setEmail(user.getEmail());
        userResponse.setRoles(user.getRoles().stream()
            .map(role -> role.getName().name())
            .collect(Collectors.toSet()));
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(userResponse);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        User user = authService.getCurrentUser();
        
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRoles(user.getRoles().stream()
            .map(role -> role.getName().name())
            .collect(Collectors.toSet()));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // In a stateless JWT system, the client is responsible for removing the token
        // We just return a success message
        return ResponseEntity.ok("Logout successful");
    }
} 