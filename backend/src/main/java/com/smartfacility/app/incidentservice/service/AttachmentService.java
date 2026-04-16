package com.smartfacility.app.incidentservice.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.smartfacility.app.incidentservice.config.CurrentUserUtil;
import com.smartfacility.app.incidentservice.dto.response.AttachmentResponseDTO;
import com.smartfacility.app.incidentservice.exception.BadRequestException;
import com.smartfacility.app.incidentservice.exception.ResourceNotFoundException;
import com.smartfacility.app.incidentservice.exception.UnauthorizedException;
import com.smartfacility.app.incidentservice.model.Ticket;
import com.smartfacility.app.incidentservice.model.TicketAttachment;
import com.smartfacility.app.incidentservice.repository.AttachmentRepository;
import org.springframework.core.io.Resource;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AttachmentService {
    private final AttachmentRepository attachmentRepository;
    private final TicketService ticketService;
    private final CurrentUserUtil currentUserUtil;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // Allowed image types only
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/jpg", "image/webp"
    );

    private static final int MAX_ATTACHMENTS = 3;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    //upload
    public AttachmentResponseDTO uploadAttachment(Long ticketId, MultipartFile file ){

        // 1. Verify ticket exists
        Ticket ticket = ticketService.findTicketOrThrow(ticketId);

        // 2. Check max 3 attachments limit
        int currentCount = attachmentRepository.countByTicketId(ticketId);
        if (currentCount >= MAX_ATTACHMENTS) {
            throw new BadRequestException(
                "Maximum " + MAX_ATTACHMENTS + " attachments allowed per ticket"
            );
        }

        // 3. Validate file is not empty
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        // 4. Validate file type — only images allowed
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException(
                "Invalid file type. Only JPEG, PNG, and WebP images are allowed"
            );
        }

         // 5. Validate file size — max 5MB
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size cannot exceed 5MB");
        }

        // 6. Generate a unique filename to prevent collisions
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String storedFilename = UUID.randomUUID().toString() + extension;

         // 7. Save file to disk
        Path uploadPath = getUploadPath(ticketId);
        try {
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), filePath,
                    StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to save file: {}", e.getMessage());
            throw new BadRequestException("Failed to save file: " + e.getMessage());
        }

        // 8. Save metadata to database
        TicketAttachment attachment = TicketAttachment.builder()
                .ticket(ticket)
                .originalFileName(originalFilename)
                .storedFileName(storedFilename)
                .fileType(contentType)
                .filePath(uploadPath.toString())
                .build();

        TicketAttachment saved = attachmentRepository.save(attachment);
        log.info("Attachment uploaded for ticket {}: {}", ticketId, storedFilename);

        return mapToResponse(saved, ticketId);

    }

    //download
    public Resource downloadAttachment(Long ticketId, Long attachmentId){
        ticketService.findTicketOrThrow(ticketId);

        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new ResourceNotFoundException(
                 "Attachment not found with id: " + attachmentId
            ));

        try {
            Path filePath = Paths.get(attachment.getFilePath())
                    .resolve(attachment.getStoredFileName());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new BadRequestException("File not found on server");
            }
            return resource;

        } catch (MalformedURLException e) {
            throw new BadRequestException("Could not read file: " + e.getMessage());
        }

    }

    //delete
    public void deleteAttachment(Long ticketId, Long attachmentId) {
        Ticket ticket = ticketService.findTicketOrThrow(ticketId);
        String userId = currentUserUtil.getCurrentUserId();

        // Only ticket owner or admin can delete attachments
        if (!ticket.getCreatedBy().equals(userId) && !currentUserUtil.isAdmin()) {
            throw new UnauthorizedException(
                    "You do not have permission to delete this attachment");
        }

        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attachment not found with id: " + attachmentId));

        // Delete file from disk
        try {
            Path filePath = Paths.get(attachment.getFilePath())
                    .resolve(attachment.getStoredFileName());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete file from disk: {}", e.getMessage());
        }

        // Delete from database
        attachmentRepository.delete(attachment);
        log.info("Attachment {} deleted from ticket {}", attachmentId, ticketId);
    }

    //get all for ticket
    public List<AttachmentResponseDTO> getAttachmentsByTicket(Long ticketId) {
        ticketService.findTicketOrThrow(ticketId);
        return attachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(a -> mapToResponse(a, ticketId))
                .collect(Collectors.toList());
    }
    //help
    private Path getUploadPath(Long ticketId) {
        // Files stored at: uploads/tickets/{ticketId}/
        return Paths.get(uploadDir, "tickets", ticketId.toString());
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }

    private AttachmentResponseDTO mapToResponse(TicketAttachment a, Long ticketId) {
        return AttachmentResponseDTO.builder()
                .id(a.getId())
                .originalFileName(a.getOriginalFileName())
                .fileType(a.getFileType())
                .uploadedAt(a.getUploadedAt())
                .downloadUrl("/api/tickets/" + ticketId +
                             "/attachments/" + a.getId() + "/download")
                .build();
    }

}
