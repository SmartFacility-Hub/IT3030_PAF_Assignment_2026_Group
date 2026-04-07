package com.smartCampus.incidentService.model;





import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;



import com.smartCampus.incidentService.enums.Category;
import com.smartCampus.incidentService.enums.Priority;
import com.smartCampus.incidentService.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Ticket {

    @Id
    @GeneratedValue(Strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String resourceLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @Column(nullable = false)
    private String contactDetails;

    // Who created this ticket (userId from JWT)
    @Column(nullable = false)
    private String createdBy;

    private String assignTo;

    // Resolution notes added by technician
    @Column(length = 2000)
    private String resolutionNotes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

     // One ticket can have many attachments
     @OneToMany(mappedBy = "ticket", cascade = CasCadeType.ALL, orphanRemoval = true)
     @Builder.Default
     private List<TicketAttachment> attachments = new ArrayList<>();

     // One ticket can have many comments
     @OneToMany(mappedBy = "ticket", cascade = CasCadeType.ALL, orphanRemoval = true)
     @Builder.Default
     private List<Comments> comments = new ArrayList<>();



}
