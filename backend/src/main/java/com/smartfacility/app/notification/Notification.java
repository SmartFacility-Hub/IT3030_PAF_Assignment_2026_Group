package com.smartfacility.app.notification;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_recipient", columnList = "recipient_email"),
        @Index(name = "idx_notif_recipient_read", columnList = "recipient_email, is_read")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Email of the user who should see this notification */
    @Column(name = "recipient_email", nullable = false, length = 150)
    private String recipientEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    /** The kind of entity this notification links to (BOOKING or TICKET) */
    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", nullable = false, length = 10)
    private ReferenceType referenceType;

    /** ID of the linked booking or ticket */
    @Column(name = "reference_id", nullable = false)
    private Long referenceId;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
