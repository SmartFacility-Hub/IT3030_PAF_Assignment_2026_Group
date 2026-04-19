package com.smartfacility.app.incidentservice.model;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "ticket_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class TicketAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String storedFileName;

    @Column(nullable = false)
    private String fileType;

    @Column(nullable = false)
    private String filePath;

    /** HTTPS URL on Cloudinary (public); safe to use as image src without JWT. */
    @Column(name = "cloudinary_url", length = 2048)
    private String cloudinaryUrl;

    /** Cloudinary public_id for delete API. */
    @Column(name = "cloudinary_public_id", length = 512)
    private String cloudinaryPublicId;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}
