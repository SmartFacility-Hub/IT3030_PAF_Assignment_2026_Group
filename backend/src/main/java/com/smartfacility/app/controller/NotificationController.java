package com.smartfacility.app.controller;

import com.smartfacility.app.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * GET /api/notifications
     * Returns notifications for the current user.
     * Admin → gets all ROLE_ADMIN notifications.
     * User  → gets notifications targeted at their email.
     */
    @GetMapping
    public ResponseEntity<?> getNotifications(Authentication auth) {
        String role = getTopRole(auth);
        String key  = role.equals("ROLE_ADMIN") ? "ROLE_ADMIN" : (String) auth.getPrincipal();
        return ResponseEntity.ok(notificationService.getForRole(key));
    }

    /**
     * GET /api/notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<?> unreadCount(Authentication auth) {
        String role = getTopRole(auth);
        String key  = role.equals("ROLE_ADMIN") ? "ROLE_ADMIN" : (String) auth.getPrincipal();
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(key)));
    }

    /**
     * PUT /api/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok(Map.of("message", "Marked as read."));
    }

    /**
     * PUT /api/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead(Authentication auth) {
        String role = getTopRole(auth);
        String key  = role.equals("ROLE_ADMIN") ? "ROLE_ADMIN" : (String) auth.getPrincipal();
        notificationService.markAllRead(key);
        return ResponseEntity.ok(Map.of("message", "All marked as read."));
    }

    private String getTopRole(Authentication auth) {
        return auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .findFirst().orElse("ROLE_USER");
    }
}