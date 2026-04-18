package com.smartfacility.app.incidentservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequestDTO {
    @NotBlank(message =  "Comment content cannot be empty")
    @Size(max = 1000, message =  "Comment cannot exceed 1000 characters")
    private String content;
}
