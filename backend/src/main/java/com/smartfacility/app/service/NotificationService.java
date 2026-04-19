package com.smartfacility.app.service;

import com.smartfacility.app.model.Notification;
import com.smartfacility.app.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // ── Generic create (used by TicketService) ────────────────
    public void create(String recipientKey, String type,
                       String title, String message,
                       String referenceType, Long referenceId) {
        Notification n = new Notification();
        n.setRecipientRole(recipientKey);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setReferenceType(referenceType);
        n.setReferenceId(referenceId);
        notificationRepository.save(n);
    }

    // ── Named helpers (used by BookingService) ────────────────

    public void notifyAdminBookingCreated(String userEmail,
                                          String facilityName,
                                          Long bookingId) {
        create(
            "ROLE_ADMIN",
            "BOOKING_CREATED",
            "New Booking Request",
            userEmail + " requested \"" + facilityName + "\" — booking #" + bookingId,
            "BOOKING",
            bookingId
        );
    }

    public void notifyAdminTicketCreated(String userEmail,
                                         String location,
                                         Long ticketId) {
        create(
            "ROLE_ADMIN",
            "TICKET_CREATED",
            "New Incident Reported",
            userEmail + " reported an issue at \"" + location + "\" — ticket #" + ticketId,
            "TICKET",
            ticketId
        );
    }

    public void notifyUserBookingApproved(String userEmail,
                                          String facilityName,
                                          Long bookingId) {
        create(
            userEmail,
            "BOOKING_APPROVED",
            "Booking Approved ✅",
            "Your booking for \"" + facilityName + "\" (#" + bookingId + ") has been approved.",
            "BOOKING",
            bookingId
        );
    }

    public void notifyUserBookingRejected(String userEmail,
                                          String facilityName,
                                          Long bookingId,
                                          String reason) {
        create(
            userEmail,
            "BOOKING_REJECTED",
            "Booking Rejected",
            "Your booking for \"" + facilityName + "\" was rejected. Reason: " + reason,
            "BOOKING",
            bookingId
        );
    }

    // ── Read operations ───────────────────────────────────────

    public List<Map<String, Object>> getForRole(String key) {
        return notificationRepository
            .findByRecipientRoleOrderByCreatedAtDesc(key)
            .stream()
            .map(this::toMap)
            .toList();
    }

    public long getUnreadCount(String key) {
        return notificationRepository.countByRecipientRoleAndReadFalse(key);
    }

    public void markRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllRead(String key) {
        notificationRepository.markAllReadForRole(key);
    }

    private Map<String, Object> toMap(Notification n) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",            n.getId());
        map.put("type",          n.getType());
        map.put("title",         n.getTitle());
        map.put("message",       n.getMessage());
        map.put("triggeredBy",   n.getTriggeredBy());
        map.put("referenceId",   n.getReferenceId());
        map.put("referenceType", n.getReferenceType());
        map.put("read",          n.isRead());
        map.put("createdAt",     n.getCreatedAt());
        return map;
    }
}