package com.smartfacility.app.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {

    @NotNull(message = "resourceId is required")
    private Long resourceId;

    @NotBlank(message = "resourceName is required")
    private String resourceName;

    @NotNull(message = "bookingDate is required")
    @Future(message = "bookingDate must be in the future")
    private LocalDate bookingDate;

    @NotNull(message = "startTime is required")
    private LocalTime startTime;

    @NotNull(message = "endTime is required")
    private LocalTime endTime;

    @NotBlank(message = "purpose is required")
    @Size(max = 500, message = "purpose must be at most 500 characters")
    private String purpose;

    @NotNull(message = "expectedAttendees is required")
    @Min(value = 1, message = "expectedAttendees must be at least 1")
    private Integer expectedAttendees;
}
