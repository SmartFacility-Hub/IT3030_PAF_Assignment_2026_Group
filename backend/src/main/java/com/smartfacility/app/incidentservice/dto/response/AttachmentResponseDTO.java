package com.smartfacility.app.incidentservice.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AttachmentResponseDTO {
    private Long id;
    private String originalFileName;
    private String fileType;
    private LocalDateTime uploadedAt;
    private String downloadUrl;


}
