package com.smartfacility.app.incidentservice.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.smartfacility.app.incidentservice.enums.Category;
import com.smartfacility.app.incidentservice.enums.Priority;
import com.smartfacility.app.incidentservice.enums.TicketStatus;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class TicketResponseDTO {
    private Long id;
    private String resourceLocation;
    private Category category;
    private String description;
    private Priority priority;
    private TicketStatus status;
    private String contactDetails;
    private String createdBy;
    private String assignedTo;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AttachmentResponseDTO> attachments;
    private List<CommentResponseDTO> comments;

}
