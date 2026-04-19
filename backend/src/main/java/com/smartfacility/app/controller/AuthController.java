package com.smartfacility.app.controller;

import com.smartfacility.app.model.User;
import com.smartfacility.app.repository.UserRepository;
import com.smartfacility.app.security.JwtUtils;
import com.smartfacility.app.service.UserProvisioningService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final UserProvisioningService userProvisioningService;
    private final JwtUtils jwtUtils;

    public AuthController(UserRepository userRepository,
                          UserProvisioningService userProvisioningService,
                          JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.userProvisioningService = userProvisioningService;
        this.jwtUtils = jwtUtils;
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
     * POST /api/auth/google
     * Alternative flow: frontend sends Google ID token, backend verifies and returns JWT.
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
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier =
                new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(),
                    com.google.api.client.json.gson.GsonFactory.getDefaultInstance()
                ).build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken googleIdToken =
                verifier.verify(idTokenString);

            if (googleIdToken == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid Google ID token"));
            }

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload =
                googleIdToken.getPayload();

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
