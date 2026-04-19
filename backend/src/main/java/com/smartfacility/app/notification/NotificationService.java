package com.smartfacility.app.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ─── Create ──────────────────────────────────────────────────────────────────

    /**
     * Persist a new notification for the given recipient.
     * This is the single entry-point called by other services.
     */
    public Notification create(String recipientEmail,
                               NotificationType type,
                               String title,
                               String message,
                               ReferenceType referenceType,
                               Long referenceId) {
        Notification notification = Notification.builder()
                .recipientEmail(recipientEmail)
                .type(type)
                .title(title)
                .message(message)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .read(false)
                .build();
        return notificationRepository.save(notification);
    }

    // ─── Read ────────────────────────────────────────────────────────────────────

    /** All notifications for the user, newest first (capped at 50 for perf). */
    public List<Notification> getNotifications(String email) {
        List<Notification> all = notificationRepository
                .findByRecipientEmailOrderByCreatedAtDesc(email);
        return all.size() > 50 ? all.subList(0, 50) : all;
    }

    /** Unread count for the badge. */
    public long getUnreadCount(String email) {
        return notificationRepository.countByRecipientEmailAndReadFalse(email);
    }

    // ─── Mark read ───────────────────────────────────────────────────────────────

    /** Mark a single notification as read (only if it belongs to this user). */
    public void markAsRead(String email, Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!n.getRecipientEmail().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    /** Mark all notifications as read for this user. */
    public void markAllAsRead(String email) {
        List<Notification> unread = notificationRepository
                .findByRecipientEmailAndReadFalseOrderByCreatedAtDesc(email);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
