package com.smartfacility.app.incidentservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.smartfacility.app.incidentservice.config.CurrentUserUtil;
import com.smartfacility.app.incidentservice.dto.request.CommentRequestDTO;
import com.smartfacility.app.incidentservice.dto.response.CommentResponseDTO;
import com.smartfacility.app.incidentservice.exception.ResourceNotFoundException;
import com.smartfacility.app.incidentservice.exception.UnauthorizedException;
import com.smartfacility.app.incidentservice.model.Comment;
import com.smartfacility.app.incidentservice.model.Ticket;
import com.smartfacility.app.incidentservice.repository.CommentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final TicketService ticketService;
    private final CurrentUserUtil currentUserUtil;

    public CommentResponseDTO addComment(Long ticketId, CommentRequestDTO dto) {
        // Verify ticket exists first
        Ticket ticket = ticketService.findTicketOrThrow(ticketId);
        String userId = currentUserUtil.getCurrentUserId();

        Comment comment = Comment.builder()
                .ticket(ticket)
                .content(dto.getContent())
                .createdBy(userId)
                .build();

        Comment saved = commentRepository.save(comment);
        return mapToResponse(saved);
    }
    public CommentResponseDTO editComment(Long ticketId, Long commentId, CommentRequestDTO dto) {
        ticketService.findTicketOrThrow(ticketId); // ensure ticket exists
        Comment comment = findCommentOrThrow(commentId);

        // Ownership check — only the author can edit their comment
        String userId = currentUserUtil.getCurrentUserId();
        if (!comment.getCreatedBy().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own comments");
        }

        comment.setContent(dto.getContent());
        return mapToResponse(commentRepository.save(comment));
    }

    public void deleteComment(Long ticketId, Long commentId) {
        ticketService.findTicketOrThrow(ticketId);
        Comment comment = findCommentOrThrow(commentId);

        String userId = currentUserUtil.getCurrentUserId();
        // User can delete own comment, admin can delete any
        if (!comment.getCreatedBy().equals(userId) && !currentUserUtil.isAdmin()) {
            throw new UnauthorizedException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }
    public List<CommentResponseDTO> getCommentsByTicket(Long ticketId) {
        ticketService.findTicketOrThrow(ticketId);
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    private CommentResponseDTO mapToResponse(Comment comment) {
        String userId = currentUserUtil.getCurrentUserId();
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdBy(comment.getCreatedBy())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .isOwner(comment.getCreatedBy().equals(userId))
                .build();
    }
     private Comment findCommentOrThrow(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
    }
}
