package com.auction.service;

import com.auction.dto.SignupRequest;
import com.auction.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User createUser(SignupRequest request);
    User updateUser(Long id, User updatedUser);
    void deleteUser(Long id);
    Optional<User> getUserById(Long id);
    Optional<User> getUserByUsername(String username);
    Optional<User> getUserByEmail(String email);
    List<User> getAllUsers();
    Page<User> getAllUsers(Pageable pageable);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    // User rating management
    void updateUserRating(Long userId, int rating);
    double getUserAverageRating(Long userId);
    int getUserRatingCount(Long userId);
    
    // Password management
    void changePassword(Long userId, String currentPassword, String newPassword);
    void resetPassword(String email);
    void confirmPasswordReset(String token, String newPassword);
    
    // Role management
    void addRoleToUser(Long userId, String roleName);
    void removeRoleFromUser(Long userId, String roleName);
    User makeFirstAdmin(Long userId);
    
    // Blocking management
    void blockUser(Long id);
    void unblockUser(Long id);
} 