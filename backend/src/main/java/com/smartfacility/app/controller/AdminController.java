package com.smartfacility.app.controller;

import com.smartfacility.app.model.ERole;
import com.smartfacility.app.model.Role;
import com.smartfacility.app.model.User;
import com.smartfacility.app.repository.RoleRepository;
import com.smartfacility.app.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public AdminController(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    /**
     * GET /api/admin/users — List all users with their roles.
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();

        List<Map<String, Object>> result = users.stream().map(user -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", user.getId());
            map.put("email", user.getEmail());
            map.put("name", user.getName());
            map.put("picture", user.getPicture());
            map.put("roles", user.getRoles().stream()
                    .map(r -> r.getName().name())
                    .toList());
            map.put("createdAt", user.getCreatedAt());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    /**
     * PUT /api/admin/users/{id}/roles — Update a user's roles.
     * Expects JSON body: { "roles": ["ROLE_USER", "ROLE_ADMIN"] }
     */
    @PutMapping("/users/{id}/roles")
    public ResponseEntity<?> updateUserRoles(@PathVariable Long id,
            @RequestBody Map<String, List<String>> body) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        List<String> roleNames = body.get("roles");
        if (roleNames == null || roleNames.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Roles cannot be empty"));
        }

        User user = userOpt.get();
        Set<Role> newRoles = new HashSet<>();

        for (String roleName : roleNames) {
            try {
                ERole eRole = ERole.valueOf(roleName);
                roleRepository.findByName(eRole).ifPresent(newRoles::add);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid role: " + roleName));
            }
        }

        user.setRoles(newRoles);
        userRepository.save(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("roles", user.getRoles().stream()
                .map(r -> r.getName().name())
                .toList());
        response.put("message", "Roles updated successfully");

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/dashboard — Returns admin dashboard statistics.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        long totalUsers = userRepository.count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("timestamp", new Date());

        return ResponseEntity.ok(stats);
    }
}
