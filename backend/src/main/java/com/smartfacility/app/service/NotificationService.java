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

    // ── Create helpers (called from BookingService & ticket service) ──

    public void notifyAdminBookingCreated(String userEmail, String facilityName, Long bookingId) {
        Notification n = new Notification();
        n.setRecipientRole("ROLE_ADMIN");
        n.setTriggeredBy(userEmail);
        n.setType("BOOKING_CREATED");
        n.setTitle("New Booking Request");
        n.setMessage(userEmail + " requested \"" + facilityName + "\" — booking #" + bookingId);
        n.setReferenceId(bookingId);
        n.setReferenceType("BOOKING");
        notificationRepository.save(n);
    }

    public void notifyAdminTicketCreated(String userEmail, String location, Long ticketId) {
        Notification n = new Notification();
        n.setRecipientRole("ROLE_ADMIN");
        n.setTriggeredBy(userEmail);
        n.setType("TICKET_CREATED");
        n.setTitle("New Incident Reported");
        n.setMessage(userEmail + " reported an issue at \"" + location + "\" — ticket #" + ticketId);
        n.setReferenceId(ticketId);
        n.setReferenceType("TICKET");
        notificationRepository.save(n);
    }

    public void notifyUserBookingApproved(String userEmail, String facilityName, Long bookingId) {
        Notification n = new Notification();
        n.setRecipientRole(userEmail); // target specific user
        n.setType("BOOKING_APPROVED");
        n.setTitle("Booking Approved");
        n.setMessage("Your booking for \"" + facilityName + "\" (booking #" + bookingId + ") has been approved.");
        n.setReferenceId(bookingId);
        n.setReferenceType("BOOKING");
        notificationRepository.save(n);
    }

    public void notifyUserBookingRejected(String userEmail, String facilityName, Long bookingId, String reason) {
        Notification n = new Notification();
        n.setRecipientRole(userEmail);
        n.setType("BOOKING_REJECTED");
        n.setTitle("Booking Rejected");
        n.setMessage("Your booking for \"" + facilityName + "\" was rejected. Reason: " + reason);
        n.setReferenceId(bookingId);
        n.setReferenceType("BOOKING");
        notificationRepository.save(n);
    }

    // ── Read operations ──

    public List<Map<String, Object>> getForRole(String role) {
        return notificationRepository
            .findByRecipientRoleOrderByCreatedAtDesc(role)
            .stream()
            .map(this::toMap)
            .toList();
    }

    public long getUnreadCount(String role) {
        return notificationRepository.countByRecipientRoleAndReadFalse(role);
    }

    public void markRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllRead(String role) {
        notificationRepository.markAllReadForRole(role);
    }

    // ── Map helper ──
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