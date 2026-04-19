package com.smartfacility.app.incidentservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignTechnicianDTO {
    @NotNull(message =  "Technician ID is required")
    private String technicianId;
}
