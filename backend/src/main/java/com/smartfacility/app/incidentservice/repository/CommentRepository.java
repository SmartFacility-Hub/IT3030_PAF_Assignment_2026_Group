package com.smartfacility.app.incidentservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartfacility.app.incidentservice.model.Comment;

public interface CommentRepository extends JpaRepository <Comment, Long> {
    List <Comment> findByTicketOrderByCreatedAtAsc(Long tickedId);
}
