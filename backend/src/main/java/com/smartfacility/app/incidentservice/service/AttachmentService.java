package com.smartfacility.app.incidentservice.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.smartfacility.app.incidentservice.config.CurrentUserUtil;
import com.smartfacility.app.incidentservice.dto.response.AttachmentResponseDTO;
import com.smartfacility.app.incidentservice.exception.BadRequestException;
import com.smartfacility.app.incidentservice.exception.ResourceNotFoundException;
import com.smartfacility.app.incidentservice.exception.UnauthorizedException;
import com.smartfacility.app.incidentservice.model.Ticket;
import com.smartfacility.app.incidentservice.model.TicketAttachment;
import com.smartfacility.app.incidentservice.repository.AttachmentRepository;
import com.smartfacility.app.incidentservice.util.AttachmentDownloadUrls;
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

    @Autowired(required = false)
    private Cloudinary cloudinary;

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

        TicketAttachment attachment;
        if (cloudinary != null) {
            attachment = uploadToCloudinary(ticket, ticketId, file, originalFilename, storedFilename, contentType);
        } else {
            attachment = saveToDisk(ticket, ticketId, file, originalFilename, storedFilename, contentType);
        }

        TicketAttachment saved = attachmentRepository.save(attachment);
        log.info("Attachment uploaded for ticket {}: {}", ticketId, storedFilename);

        return mapToResponse(saved, ticketId);

    }

    // download (local file or Cloudinary HTTPS URL)
    public AttachmentDownload downloadAttachment(Long ticketId, Long attachmentId) {
        ticketService.findTicketOrThrow(ticketId);

        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new ResourceNotFoundException(
                 "Attachment not found with id: " + attachmentId
            ));

        if (attachment.getTicket() == null || !attachment.getTicket().getId().equals(ticketId)) {
            throw new ResourceNotFoundException("Attachment not found with id: " + attachmentId);
        }

        try {
            if (StringUtils.hasText(attachment.getCloudinaryUrl())) {
                Resource resource = new UrlResource(URI.create(attachment.getCloudinaryUrl().trim()));
                return new AttachmentDownload(resource, attachment.getFileType());
            }

            Path filePath = Paths.get(attachment.getFilePath())
                    .resolve(attachment.getStoredFileName());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new BadRequestException("File not found on server");
            }
            return new AttachmentDownload(resource, attachment.getFileType());

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

        if (StringUtils.hasText(attachment.getCloudinaryPublicId()) && cloudinary != null) {
            try {
                cloudinary.uploader().destroy(
                        attachment.getCloudinaryPublicId(),
                        ObjectUtils.asMap("resource_type", "image"));
            } catch (Exception e) {
                log.warn("Could not delete image from Cloudinary: {}", e.getMessage());
            }
        } else {
            try {
                Path filePath = Paths.get(attachment.getFilePath())
                        .resolve(attachment.getStoredFileName());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                log.warn("Could not delete file from disk: {}", e.getMessage());
            }
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
                .downloadUrl(AttachmentDownloadUrls.build(a, ticketId))
                .build();
    }

    private TicketAttachment saveToDisk(
            Ticket ticket,
            Long ticketId,
            MultipartFile file,
            String originalFilename,
            String storedFilename,
            String contentType) {
        Path uploadPath = getUploadPath(ticketId);
        try {
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to save file: {}", e.getMessage());
            throw new BadRequestException("Failed to save file: " + e.getMessage());
        }
        return TicketAttachment.builder()
                .ticket(ticket)
                .originalFileName(originalFilename)
                .storedFileName(storedFilename)
                .fileType(contentType)
                .filePath(uploadPath.toString())
                .build();
    }

    @SuppressWarnings("unchecked")
    private TicketAttachment uploadToCloudinary(
            Ticket ticket,
            Long ticketId,
            MultipartFile file,
            String originalFilename,
            String storedFilename,
            String contentType) {
        try {
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "smartfacility/tickets/" + ticketId,
                            "resource_type", "image"));
            String secureUrl = (String) result.get("secure_url");
            String publicId = (String) result.get("public_id");
            if (!StringUtils.hasText(secureUrl) || !StringUtils.hasText(publicId)) {
                throw new BadRequestException("Cloudinary did not return an image URL");
            }
            return TicketAttachment.builder()
                    .ticket(ticket)
                    .originalFileName(originalFilename)
                    .storedFileName(storedFilename)
                    .fileType(contentType)
                    .filePath("cloudinary")
                    .cloudinaryUrl(secureUrl.trim())
                    .cloudinaryPublicId(publicId.trim())
                    .build();
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Cloudinary upload failed: {}", e.getMessage());
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

}
