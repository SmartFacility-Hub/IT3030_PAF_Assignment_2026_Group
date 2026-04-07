package com.smartcampus.incidentservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.incidentservice.model.Ticket;
import com.smartcampus.incidentservice.enums.TicketStatus;
import com.smartcampus.incidentservice.enums.Priority;


@Repository
public interface TicketRepository extends JpaRepository<Ticket,Long> {

    //find all tickets created by a specific user
    List<Ticket> findByCreatedBy(String createdBy);

    //Find tickets by status
    List<Ticket> findByStatus(TicketStatus status);

    //Find tickets by status AND priority
    List<Ticket> findByStatusAndPriority(TicketStatus status, Priority priority);

    //Find all tickets by a specific user with a specific status
    List<Ticket> findByCreatedByAndStatus(String createdBy, TicketStatus status);

}
