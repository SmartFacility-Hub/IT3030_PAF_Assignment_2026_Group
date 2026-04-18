package com.smartfacility.app.incidentservice.dto.request;

import com.smartfacility.app.incidentservice.enums.Category;
import com.smartfacility.app.incidentservice.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketRequestDTO {

    @NotBlank(message = "Resource location is requireed")
    private String resourceLocation;

    @NotNull(message = "category is required")
    private Category category;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

}
