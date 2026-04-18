package com.smartfacility.app.incidentservice.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartfacility.app.incidentservice.dto.response.AttachmentResponseDTO;
import com.smartfacility.app.incidentservice.service.AttachmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
public class AttachmentController {
    private final AttachmentService attachmentService;

    // POST /api/tickets/{ticketId}/attachments
    // Upload one image (call up to 3 times)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentResponseDTO> uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file) {

        AttachmentResponseDTO response =
                attachmentService.uploadAttachment(ticketId, file);
        return ResponseEntity.status(201).body(response);
    }

    // GET /api/tickets/{ticketId}/attachments
    // Get list of all attachments for a ticket
    @GetMapping
    public ResponseEntity<List<AttachmentResponseDTO>> getAttachments(
            @PathVariable Long ticketId) {
        return ResponseEntity.ok(
                attachmentService.getAttachmentsByTicket(ticketId));
    }

    // GET /api/tickets/{ticketId}/attachments/{attachmentId}/download
    // Download/view the actual image file
    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {

        Resource resource =
                attachmentService.downloadAttachment(ticketId, attachmentId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" +
                        resource.getFilename() + "\"")
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
    // DELETE /api/tickets/{ticketId}/attachments/{attachmentId}
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {
        attachmentService.deleteAttachment(ticketId, attachmentId);
        return ResponseEntity.noContent().build();
    }
}
