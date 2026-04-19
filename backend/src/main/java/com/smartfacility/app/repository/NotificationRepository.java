package com.smartfacility.app.repository;

import com.smartfacility.app.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // All notifications for a role, newest first
    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(String recipientRole);

    // Unread count
    long countByRecipientRoleAndReadFalse(String recipientRole);

    // Mark all read for a role
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipientRole = :role")
    void markAllReadForRole(String role);
}