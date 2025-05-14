package com.auction.controller;

import com.auction.dto.SignupRequest;
import com.auction.dto.UserResponse;
import com.auction.dto.UpdateUserRequest;
import com.auction.dto.ChangePasswordRequest;
import com.auction.model.User;
import com.auction.model.ERole;
import com.auction.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(@RequestBody SignupRequest request) {
        User user = userService.createUser(request);
        return ResponseEntity.ok(mapToUserResponse(user));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        User user = userService.getUserById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return ResponseEntity.ok(mapToUserResponse(user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        User user = userService.updateUserProfile(id, request);
        return ResponseEntity.ok(mapToUserResponse(user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        Page<User> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users.map(this::mapToUserResponse));
    }

    @PostMapping("/{id}/make-first-admin")
    public ResponseEntity<UserResponse> makeFirstAdmin(@PathVariable Long id) {
        User user = userService.makeFirstAdmin(id);
        return ResponseEntity.ok(mapToUserResponse(user));
    }

    @PutMapping("/{id}/change-password")
    @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest req) {
        userService.changePassword(id, req.getCurrentPassword(), req.getNewPassword());
        return ResponseEntity.ok().build();
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRoles(user.getRoles().stream()
            .map(role -> role.getName().name())
            .collect(Collectors.toSet()));
        response.setBlocked(user.getBlocked());
        return response;
    }
} 