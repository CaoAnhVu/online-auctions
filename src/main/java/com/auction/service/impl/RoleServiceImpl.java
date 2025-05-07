package com.auction.service.impl;

import com.auction.model.ERole;
import com.auction.model.Role;
import com.auction.repository.RoleRepository;
import com.auction.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Optional<Role> getRoleByName(ERole name) {
        return roleRepository.findByName(name);
    }

    @Override
    public Role createRole(ERole name) {
        Role role = Role.builder()
                .name(name)
                .build();
        return roleRepository.save(role);
    }

    @Override
    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }

    @Override
    public boolean existsByName(ERole name) {
        return roleRepository.findByName(name).isPresent();
    }
} 