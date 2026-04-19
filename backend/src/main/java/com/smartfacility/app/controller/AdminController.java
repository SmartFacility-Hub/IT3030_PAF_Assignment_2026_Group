package com.smartfacility.app.controller;

import com.smartfacility.app.model.ERole;
import com.smartfacility.app.model.Role;
import com.smartfacility.app.model.User;
import com.smartfacility.app.repository.RoleRepository;
import com.smartfacility.app.repository.UserRepository;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
            
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
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
     * POST /api/admin/users — Create a new user.
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");
        String password = body.get("password");

        if (email == null || name == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email, name, and password are required"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "User with this email already exists"));
        }

        User user = new User(email, name, passwordEncoder.encode(password));
        
        Set<Role> roles = new HashSet<>();
        roleRepository.findByName(ERole.ROLE_USER).ifPresent(roles::add);
        user.setRoles(roles);

        userRepository.save(user);

        return ResponseEntity.status(201).body(Map.of("message", "User created successfully", "id", user.getId()));
    }

    /**
     * GET /api/admin/users/{id} — Retrieve a user.
     * Satisfies REST Constraints: Client-Server, Stateless, Cacheable, Layered System, Uniform Interface (HATEOAS).
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("picture", user.getPicture());
        response.put("roles", user.getRoles().stream().map(r -> r.getName().name()).toList());
        response.put("createdAt", user.getCreatedAt());

        // HATEOAS / Uniform Interface (_links implementation)
        Map<String, Object> links = new LinkedHashMap<>();
        links.put("self", Map.of("href", "/api/admin/users/" + id, "method", "GET"));
        links.put("update", Map.of("href", "/api/admin/users/" + id, "method", "PUT"));
        links.put("delete", Map.of("href", "/api/admin/users/" + id, "method", "DELETE"));
        links.put("collection", Map.of("href", "/api/admin/users", "method", "GET"));
        response.put("_links", links);

        // Cacheability constraint (Cache-Control Header)
        CacheControl cacheControl = CacheControl.maxAge(60, TimeUnit.SECONDS).cachePrivate();

        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .eTag("\"" + user.getId() + "-" + user.getUpdatedAt() + "\"")
                .body(response);
    }

    /**
     * PUT /api/admin/users/{id} — Update user details (name, email).
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        
        if (body.containsKey("name")) {
            user.setName(body.get("name"));
        }
        
        if (body.containsKey("email")) {
            String newEmail = body.get("email");
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is already taken"));
            }
            user.setEmail(newEmail);
        }

        if (body.containsKey("password") && body.get("password") != null && !body.get("password").isBlank()) {
            user.setPassword(passwordEncoder.encode(body.get("password")));
        }

        userRepository.save(user);

        return ResponseEntity.ok().body(Map.of("message", "User updated successfully", "id", user.getId()));
    }

    /**
     * DELETE /api/admin/users/{id} — Delete a user.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().body(Map.of("message", "User deleted successfully"));
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
