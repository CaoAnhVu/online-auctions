package com.auction.service;

import com.auction.model.ERole;
import com.auction.model.Role;

import java.util.List;
import java.util.Optional;

public interface RoleService {
    List<Role> getAllRoles();
    Optional<Role> getRoleByName(ERole name);
    Role createRole(ERole name);
    void deleteRole(Long id);
    boolean existsByName(ERole name);
} 