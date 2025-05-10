package com.auction.service.impl;

import com.auction.dto.SignupRequest;
import com.auction.model.ERole;
import com.auction.model.Role;
import com.auction.model.User;
import com.auction.repository.UserRepository;
import com.auction.service.RoleService;
import com.auction.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User createUser(SignupRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRoles(new HashSet<>());
        
        // Set default role
        Role userRole = roleService.getRoleByName(ERole.ROLE_USER)
            .orElseThrow(() -> new RuntimeException("Default role not found"));
        user.getRoles().add(userRole);
            
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUser(Long id, User updatedUser) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
            
        user.setFullName(updatedUser.getFullName());
        user.setPhoneNumber(updatedUser.getPhoneNumber());
        user.setEmail(updatedUser.getEmail());
        
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional
    public void updateUserRating(Long userId, int rating) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            
        double currentRating = user.getRating();
        int currentCount = user.getRatingCount();
        
        double newRating = ((currentRating * currentCount) + rating) / (currentCount + 1);
        
        user.setRating(newRating);
        user.setRatingCount(currentCount + 1);
        
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public double getUserAverageRating(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return user.getRating();
    }

    @Override
    @Transactional(readOnly = true)
    public int getUserRatingCount(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return user.getRatingCount();
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resetPassword(String email) {
    }

    @Override
    @Transactional
    public void confirmPasswordReset(String token, String newPassword) {
    }

    @Override
    @Transactional
    public void addRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            
        roleService.getRoleByName(ERole.valueOf(roleName))
            .ifPresent(role -> user.getRoles().add(role));
            
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removeRoleFromUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            
        roleService.getRoleByName(ERole.valueOf(roleName))
            .ifPresent(role -> user.getRoles().remove(role));
            
        userRepository.save(user);
    }

    @Override
    @Transactional
    public User makeFirstAdmin(Long userId) {
        // Check if any admin exists
        List<User> allUsers = userRepository.findAll();
        boolean hasAdmin = allUsers.stream()
            .flatMap(u -> u.getRoles().stream())
            .anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);
            
        if (hasAdmin) {
            throw new RuntimeException("Admin already exists in the system");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            
        // Add ADMIN role
        roleService.getRoleByName(ERole.ROLE_ADMIN)
            .ifPresent(role -> user.getRoles().add(role));
            
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void blockUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void unblockUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUserProfile(Long id, com.auction.dto.UpdateUserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        return userRepository.save(user);
    }
} 