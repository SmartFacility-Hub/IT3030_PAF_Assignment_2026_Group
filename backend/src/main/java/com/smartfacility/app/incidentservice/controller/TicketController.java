package com.smartfacility.app.incidentservice.controller;

import com.smartfacility.app.incidentservice.dto.request.*;
import com.smartfacility.app.incidentservice.dto.response.*;
import com.smartfacility.app.incidentservice.enums.TicketStatus;
import com.smartfacility.app.incidentservice.service.CommentService;
import com.smartfacility.app.incidentservice.service.TicketService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final CommentService commentService;

    // POST /api/tickets — create a new ticket
    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody TicketRequestDTO dto) {
        TicketResponseDTO response = ticketService.createTicket(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/tickets — get all tickets (filtered optionally by status)
    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(
            @RequestParam(required = false) TicketStatus status) {
        return ResponseEntity.ok(ticketService.getAllTickets(status));
    }

    // GET /api/tickets/{id} — get one ticket
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // PUT /api/tickets/{id}/status — update ticket status
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO dto) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, dto));
    }

    // PUT /api/tickets/{id}/assign — assign technician (admin only)
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianDTO dto) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, dto));
    }

    // POST /api/tickets/{id}/comments — add a comment
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(id, dto));
    }

    // PUT /api/tickets/{id}/comments/{commentId} — edit own comment
    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<CommentResponseDTO> editComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequestDTO dto) {
        return ResponseEntity.ok(commentService.editComment(id, commentId, dto));
    }

    // DELETE /api/tickets/{id}/comments/{commentId} — delete own comment
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @PathVariable Long commentId) {
        commentService.deleteComment(id, commentId);
        return ResponseEntity.noContent().build();
    }


}
