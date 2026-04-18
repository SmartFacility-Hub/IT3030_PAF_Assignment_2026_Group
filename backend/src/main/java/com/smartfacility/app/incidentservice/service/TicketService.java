package com.smartfacility.app.incidentservice.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.smartfacility.app.incidentservice.config.CurrentUserUtil;
import com.smartfacility.app.incidentservice.dto.request.AssignTechnicianDTO;
import com.smartfacility.app.incidentservice.dto.request.StatusUpdateDTO;
import com.smartfacility.app.incidentservice.dto.request.TicketRequestDTO;
import com.smartfacility.app.incidentservice.dto.response.AttachmentResponseDTO;
import com.smartfacility.app.incidentservice.dto.response.CommentResponseDTO;
import com.smartfacility.app.incidentservice.dto.response.TicketResponseDTO;
import com.smartfacility.app.incidentservice.enums.TicketStatus;
import com.smartfacility.app.incidentservice.exception.BadRequestException;
import com.smartfacility.app.incidentservice.exception.ResourceNotFoundException;
import com.smartfacility.app.incidentservice.exception.UnauthorizedException;
import com.smartfacility.app.incidentservice.model.Ticket;
import com.smartfacility.app.incidentservice.repository.TicketRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CurrentUserUtil currentUserUtil;

    //create
    public TicketResponseDTO createTicket(TicketRequestDTO dto){
        String userId = currentUserUtil.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("You must be logged in to create a ticket");
        }

        Ticket ticket = Ticket.builder()
            .resourceLocation(dto.getResourceLocation())
            .category(dto.getCategory())
            .description(dto.getDescription())
            .priority(dto.getPriority())
            .status(TicketStatus.OPEN)  // always starts as OPEN
            .createdBy(userId)
            .build();

            Ticket saved = ticketRepository.save(ticket);
            return mapToResponse(saved);

    }
    // ─── GET ONE ──────────────────────────────────────────────
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = findTicketOrThrow(id);
        String userId = currentUserUtil.getCurrentUserId();

        // Admins see all tickets
        if (currentUserUtil.isAdmin()) {
            return mapToResponse(ticket);
        }

        // Technicians can see tickets assigned to them
        if (currentUserUtil.isTechnician()) {
            if (!Objects.equals(ticket.getAssignTo(), userId)) {
                throw new UnauthorizedException("You can only view tickets assigned to you");
            }
            return mapToResponse(ticket);
        }

        // Regular users can only see their own tickets
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
            // Admin sees all tickets, optionally filtered by status
            tickets = (status != null)
                    ? ticketRepository.findByStatus(status)
                    : ticketRepository.findAll();
        } else if (currentUserUtil.isTechnician()) {
            // Technician sees only tickets assigned to them
            tickets = (status != null)
                    ? ticketRepository.findByAssignToAndStatus(userId, status)
                    : ticketRepository.findByAssignTo(userId);
        } else {
            // Regular user sees only their own tickets
            tickets = (status != null)
                    ? ticketRepository.findByCreatedByAndStatus(userId, status)
                    : ticketRepository.findByCreatedBy(userId);
        }

        return tickets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

     // ─── UPDATE STATUS ────────────────────────────────────────
    public TicketResponseDTO updateTicketStatus(Long id, StatusUpdateDTO dto) {
        Ticket ticket = findTicketOrThrow(id);
        String userId = currentUserUtil.getCurrentUserId();

        // Only admins or the assigned technician can update status
        boolean isAssignedTechnician = currentUserUtil.isTechnician()
                && Objects.equals(ticket.getAssignTo(), userId);

        if (!currentUserUtil.isAdmin() && !isAssignedTechnician) {
            throw new UnauthorizedException(
                "Only admins or the assigned technician can update the ticket status");
        }

        // Validate the status transition is allowed
        validateStatusTransition(ticket.getStatus(), dto.getStatus());

        // REJECTED requires a reason
        if (dto.getStatus() == TicketStatus.REJECTED) {
            if (dto.getReason() == null || dto.getReason().isBlank()) {
                throw new BadRequestException("A reason is required when rejecting a ticket");
            }
            ticket.setResolutionNotes("REJECTED: " + dto.getReason());
        }

        // RESOLVED requires resolution notes
        if (dto.getStatus() == TicketStatus.RESOLVED) {
            if (dto.getResolutionNotes() == null || dto.getResolutionNotes().isBlank()) {
                throw new BadRequestException("Resolution notes are required when resolving a ticket");
            }
            ticket.setResolutionNotes(dto.getResolutionNotes());
        }

        ticket.setStatus(dto.getStatus());
        return mapToResponse(ticketRepository.save(ticket));
    }

    // ─── ASSIGN TECHNICIAN ────────────────────────────────────
    public TicketResponseDTO assignTechnician(Long id, AssignTechnicianDTO dto) {
        if (!currentUserUtil.isAdmin()) {
            throw new UnauthorizedException("Only admins can assign technicians");
        }

        Ticket ticket = findTicketOrThrow(id);
        ticket.setAssignTo(dto.getTechnicianId());

        // Auto-move to IN_PROGRESS when technician is assigned
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        return mapToResponse(ticketRepository.save(ticket));
    }

    // ─── STATE MACHINE ────────────────────────────────────────
    // This enforces the workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN        -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED   || next == TicketStatus.REJECTED;
            case RESOLVED    -> next == TicketStatus.CLOSED;
            case CLOSED, REJECTED -> false; // terminal states — no further changes
        };

        if (!valid) {
            throw new BadRequestException(
                "Invalid status transition: " + current + " → " + next
            );
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
                        .downloadUrl("/api/tickets/" + ticket.getId() + "/attachments/" + a.getId())
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
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

}
