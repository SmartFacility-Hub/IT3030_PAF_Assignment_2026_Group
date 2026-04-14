package com.smartfacility.app.incidentservice.dto.request;

import jakarta.validation.constraints.NotNull;

public class AssignTechnicianDTO {
    @NotNull(message =  "Technician ID is required")
    private String technicianId;
}
