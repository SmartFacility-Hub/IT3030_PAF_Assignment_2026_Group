package com.smartfacility.app.incidentservice.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartfacility.app.incidentservice.config.CurrentUserUtil;
import com.smartfacility.app.incidentservice.dto.request.AssignTechnicianDTO;
import com.smartfacility.app.incidentservice.dto.request.StatusUpdateDTO;
import com.smartfacility.app.incidentservice.dto.request.TicketRequestDTO;
import com.smartfacility.app.incidentservice.dto.response.AttachmentResponseDTO;
import com.smartfacility.app.incidentservice.util.AttachmentDownloadUrls;
import com.smartfacility.app.incidentservice.dto.response.CommentResponseDTO;
import com.smartfacility.app.incidentservice.dto.response.TicketResponseDTO;
import com.smartfacility.app.incidentservice.enums.TicketStatus;
import com.smartfacility.app.incidentservice.exception.BadRequestException;
import com.smartfacility.app.incidentservice.exception.ResourceNotFoundException;
import com.smartfacility.app.incidentservice.exception.UnauthorizedException;
import com.smartfacility.app.incidentservice.model.Ticket;
import com.smartfacility.app.incidentservice.repository.TicketRepository;

// ── Unified notification service ──────────────────────────────
import com.smartfacility.app.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository    ticketRepository;
    private final CurrentUserUtil     currentUserUtil;
    private final NotificationService notificationService;  // unified service

    // ─── CREATE ───────────────────────────────────────────────
    public TicketResponseDTO createTicket(TicketRequestDTO dto) {
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("You must be logged in to create a ticket");
        }

        Ticket ticket = Ticket.builder()
            .resourceLocation(dto.getResourceLocation())
            .category(dto.getCategory())
            .description(dto.getDescription())
            .priority(dto.getPriority())
            .status(TicketStatus.OPEN)
            .createdBy(userId)
            .build();

        Ticket saved = ticketRepository.save(ticket);

        // ── Notify admin about new ticket ──────────────────────
        try {
            notificationService.notifyAdminTicketCreated(
                userId,
                saved.getResourceLocation(),
                saved.getId()
            );
        } catch (Exception ignored) {}

        return mapToResponse(saved);
    }

    // ─── GET ONE ──────────────────────────────────────────────
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = findTicketOrThrow(id);
        String userId = currentUserUtil.getCurrentUserId();

        if (currentUserUtil.isAdmin()) {
            return mapToResponse(ticket);
        }

        if (currentUserUtil.isTechnician()) {
            if (!Objects.equals(ticket.getAssignTo(), userId)) {
                throw new UnauthorizedException("You can only view tickets assigned to you");
            }
            return mapToResponse(ticket);
        }

        if (!Objects.equals(ticket.getCreatedBy(), userId)) {
            throw new UnauthorizedException("You do not have permission to view this ticket");
        }

        return mapToResponse(ticket);
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public List<TicketResponseDTO> getAllTickets(TicketStatus status) {
        String userId = currentUserUtil.getCurrentUserId();
        List<Ticket> tickets;

        if (currentUserUtil.isAdmin()) {
            tickets = (status != null)
                ? ticketRepository.findByStatus(status)
                : ticketRepository.findAll();
        } else if (currentUserUtil.isTechnician()) {
            tickets = (status != null)
                ? ticketRepository.findByAssignToAndStatus(userId, status)
                : ticketRepository.findByAssignTo(userId);
        } else {
            tickets = (status != null)
                ? ticketRepository.findByCreatedByAndStatus(userId, status)
                : ticketRepository.findByCreatedBy(userId);
        }

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ─── UPDATE STATUS ────────────────────────────────────────
    public TicketResponseDTO updateTicketStatus(Long id, StatusUpdateDTO dto) {
        Ticket ticket = findTicketOrThrow(id);
        String userId = currentUserUtil.getCurrentUserId();

        boolean isAssignedTechnician = currentUserUtil.isTechnician()
            && Objects.equals(ticket.getAssignTo(), userId);

        if (!currentUserUtil.isAdmin() && !isAssignedTechnician) {
            throw new UnauthorizedException(
                "Only admins or the assigned technician can update the ticket status");
        }

        if (isAssignedTechnician && !currentUserUtil.isAdmin()) {
            if (dto.getStatus() == TicketStatus.REJECTED) {
                throw new UnauthorizedException("Only administrators can reject tickets");
            }
            boolean techAllowed = ticket.getStatus() == TicketStatus.IN_PROGRESS
                && dto.getStatus() == TicketStatus.RESOLVED;
            if (!techAllowed) {
                throw new UnauthorizedException(
                    "Technicians may only mark in-progress tickets as resolved");
            }
        }

        validateStatusTransition(ticket.getStatus(), dto.getStatus());

        if (dto.getStatus() == TicketStatus.REJECTED) {
            if (dto.getReason() == null || dto.getReason().isBlank()) {
                throw new BadRequestException("A reason is required when rejecting a ticket");
            }
            ticket.setResolutionNotes("REJECTED: " + dto.getReason());
        }

        if (dto.getStatus() == TicketStatus.RESOLVED) {
            if (dto.getResolutionNotes() == null || dto.getResolutionNotes().isBlank()) {
                throw new BadRequestException("Resolution notes are required when resolving a ticket");
            }
            ticket.setResolutionNotes(dto.getResolutionNotes());
        }

        ticket.setStatus(dto.getStatus());
        Ticket saved = ticketRepository.save(ticket);

        // ── Notify ticket creator about the status change ──────
        try {
            String statusLabel = dto.getStatus().name().replace("_", " ").toLowerCase();
            notificationService.create(
                ticket.getCreatedBy(),
                "TICKET_STATUS_CHANGED",
                "Ticket #" + ticket.getId() + " — Status Updated",
                "Your ticket has been moved to " + statusLabel + ".",
                "TICKET",
                ticket.getId()
            );
        } catch (Exception ignored) {}

        return mapToResponse(saved);
    }

    // ─── ASSIGN TECHNICIAN ────────────────────────────────────
    public TicketResponseDTO assignTechnician(Long id, AssignTechnicianDTO dto) {
        if (!currentUserUtil.isAdmin()) {
            throw new UnauthorizedException("Only admins can assign technicians");
        }

        Ticket ticket = findTicketOrThrow(id);
        ticket.setAssignTo(dto.getTechnicianId());

        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        Ticket saved = ticketRepository.save(ticket);

        // ── Notify the assigned technician ─────────────────────
        try {
            notificationService.create(
                dto.getTechnicianId(),
                "TICKET_ASSIGNED",
                "Ticket #" + ticket.getId() + " Assigned to You",
                "You have been assigned to ticket at \"" + ticket.getResourceLocation() + "\".",
                "TICKET",
                ticket.getId()
            );
        } catch (Exception ignored) {}

        return mapToResponse(saved);
    }

    // ─── DELETE ───────────────────────────────────────────────
    @Transactional
    public void deleteTicketAsAdmin(Long id) {
        if (!currentUserUtil.isAdmin()) {
            throw new UnauthorizedException("Only administrators can delete tickets");
        }
        Ticket ticket = findTicketOrThrow(id);
        if (ticket.getStatus() != TicketStatus.CLOSED
                && ticket.getStatus() != TicketStatus.REJECTED) {
            throw new BadRequestException("Only closed or rejected tickets can be deleted");
        }
        ticketRepository.delete(ticket);
    }

    // ─── STATE MACHINE ────────────────────────────────────────
    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN        -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED   || next == TicketStatus.REJECTED;
            case RESOLVED    -> next == TicketStatus.CLOSED;
            case CLOSED, REJECTED -> false;
        };
        if (!valid) {
            throw new BadRequestException(
                "Invalid status transition: " + current + " → " + next);
        }
    }

    // ─── MAPPER ───────────────────────────────────────────────
    public TicketResponseDTO mapToResponse(Ticket ticket) {
        String userId = currentUserUtil.getCurrentUserId();

        List<AttachmentResponseDTO> attachments = ticket.getAttachments().stream()
            .map(a -> AttachmentResponseDTO.builder()
                .id(a.getId())
                .originalFileName(a.getOriginalFileName())
                .fileType(a.getFileType())
                .uploadedAt(a.getUploadedAt())
                .downloadUrl(AttachmentDownloadUrls.build(a, ticket.getId()))
                .build())
            .collect(Collectors.toList());

        List<CommentResponseDTO> comments = ticket.getComments().stream()
            .map(c -> CommentResponseDTO.builder()
                .id(c.getId())
                .content(c.getContent())
                .createdBy(c.getCreatedBy())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .isOwner(Objects.equals(c.getCreatedBy(), userId))
                .build())
            .collect(Collectors.toList());

        return TicketResponseDTO.builder()
            .id(ticket.getId())
            .resourceLocation(ticket.getResourceLocation())
            .category(ticket.getCategory())
            .description(ticket.getDescription())
            .priority(ticket.getPriority())
            .status(ticket.getStatus())
            .createdBy(ticket.getCreatedBy())
            .assignedTo(ticket.getAssignTo())
            .resolutionNotes(ticket.getResolutionNotes())
            .createdAt(ticket.getCreatedAt())
            .updatedAt(ticket.getUpdatedAt())
            .attachments(attachments)
            .comments(comments)
            .build();
    }

    // ─── HELPER ───────────────────────────────────────────────
    public Ticket findTicketOrThrow(Long id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Ticket not found with id: " + id));
    }
}