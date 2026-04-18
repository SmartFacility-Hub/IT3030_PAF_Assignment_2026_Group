package com.smartfacility.app.incidentservice.dto.request;

import com.smartfacility.app.incidentservice.enums.TicketStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatusUpdateDTO {
    @NotNull(message = "status is required")
    private TicketStatus status;

    // Required when status is REJECTED
    private String reason;

    // Resolution notes when status is RESOLVED
    private String resolutionNotes;

}
