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

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}
