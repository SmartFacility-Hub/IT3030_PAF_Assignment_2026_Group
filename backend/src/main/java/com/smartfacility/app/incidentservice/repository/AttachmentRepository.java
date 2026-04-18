package com.smartfacility.app.incidentservice.repository;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.smartfacility.app.incidentservice.model.TicketAttachment;

@Repository
public interface AttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    List<TicketAttachment> findByTicketId(long tickedId);

    // Count how many attachments a ticket already has
    int countByTicketId(Long ticketId);
}
