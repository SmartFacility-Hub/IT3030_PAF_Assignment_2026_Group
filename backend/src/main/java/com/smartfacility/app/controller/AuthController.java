package com.smartfacility.app.controller;

import com.smartfacility.app.model.User;
import com.smartfacility.app.repository.UserRepository;
import com.smartfacility.app.security.JwtUtils;
import com.smartfacility.app.service.UserProvisioningService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.smartfacility.app.model.Role;
import com.smartfacility.app.model.ERole;
import com.smartfacility.app.repository.RoleRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserProvisioningService userProvisioningService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository,
                          RoleRepository roleRepository,
                          UserProvisioningService userProvisioningService,
                          JwtUtils jwtUtils,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userProvisioningService = userProvisioningService;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * GET /api/auth/me
     * Returns the current authenticated user's info based on the JWT.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String email = (String) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("picture", user.getPicture());
        response.put("roles", roles);
        response.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/register
     * Register a new account using email + password.
     * Expects JSON body: { "name": "...", "email": "...", "password": "..." }
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");

        if (name == null || name.isBlank() || email == null || email.isBlank()
                || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email and password are required"));
        }

        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "An account with this email already exists"));
        }

        User user = new User(email, name, passwordEncoder.encode(password));

        // Assign default ROLE_USER
        Set<Role> roles = new HashSet<>();
        roleRepository.findByName(ERole.ROLE_USER).ifPresent(roles::add);
        user.setRoles(roles);

        user = userRepository.save(user);

        // Generate JWT
        List<String> roleNames = user.getRoles().stream()
                .map(r -> r.getName().name())
                .toList();

        String token = jwtUtils.generateToken(email, name, "", user.getId(), roleNames);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("picture", "");
        response.put("roles", roleNames);

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * Log in with email + password.
     * Expects JSON body: { "email": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        User user = userOpt.get();

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.status(401).body(
                    Map.of("error", "This account uses Google sign-in. Please use Google to log in."));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        // Generate JWT
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .toList();

        String token = jwtUtils.generateToken(email, user.getName(),
                user.getPicture() != null ? user.getPicture() : "", user.getId(), roles);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("picture", user.getPicture() != null ? user.getPicture() : "");
        response.put("roles", roles);

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/google
     * Alternative flow: frontend sends Google ID token, backend verifies and
     * returns JWT.
     * Expects JSON body: { "credential": "GOOGLE_ID_TOKEN" }
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String idTokenString = body.get("credential");

        if (idTokenString == null || idTokenString.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing credential"));
        }

        try {
            // Verify Google ID token
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier = new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(),
                    com.google.api.client.json.gson.GsonFactory.getDefaultInstance()).build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken googleIdToken = verifier.verify(idTokenString);

            if (googleIdToken == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid Google ID token"));
            }

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = googleIdToken.getPayload();

            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            String googleId = payload.getSubject();

            User user = userProvisioningService.provisionFromGoogle(email, name, picture, googleId);

            // Generate JWT
            List<String> roles = user.getRoles().stream()
                    .map(r -> r.getName().name())
                    .toList();

            String token = jwtUtils.generateToken(user.getEmail(), user.getName(), user.getPicture(), user.getId(), roles);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("token", token);
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("picture", user.getPicture());
            response.put("roles", roles);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Authentication failed: " + e.getMessage()));
        }
    }
}
