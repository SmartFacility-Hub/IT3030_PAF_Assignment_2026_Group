package com.smartfacility.app.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** All notifications for a user, newest first */
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);

    /** Only unread notifications, newest first */
    List<Notification> findByRecipientEmailAndReadFalseOrderByCreatedAtDesc(String recipientEmail);

    /** Count of unread notifications */
    long countByRecipientEmailAndReadFalse(String recipientEmail);
}
