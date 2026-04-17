package com.smartfacility.app.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** GET /api/notifications — list all (max 50) for the authenticated user */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<Notification> notifications = notificationService.getNotifications(email);

        List<Map<String, Object>> result = notifications.stream().map(n -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", n.getId());
            map.put("type", n.getType().name());
            map.put("title", n.getTitle());
            map.put("message", n.getMessage());
            map.put("referenceType", n.getReferenceType().name());
            map.put("referenceId", n.getReferenceId());
            map.put("read", n.isRead());
            map.put("createdAt", n.getCreatedAt());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    /** GET /api/notifications/unread-count — count of unread notifications */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        String email = (String) auth.getPrincipal();
        long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /** PUT /api/notifications/{id}/read — mark one notification as read */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        notificationService.markAsRead(email, id);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    /** PUT /api/notifications/read-all — mark all notifications as read */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication auth) {
        String email = (String) auth.getPrincipal();
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
