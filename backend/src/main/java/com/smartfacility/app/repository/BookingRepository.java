package com.smartfacility.app.repository;

import com.smartfacility.app.model.Booking;
import com.smartfacility.app.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ── User's own bookings ──
    List<Booking> findByUserEmailOrderByCreatedAtDesc(String email);

    // ── Admin: all bookings with optional status filter ──
    List<Booking> findAllByOrderByCreatedAtDesc();
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    // ── Conflict detection ──
    // Finds any APPROVED or PENDING bookings that overlap with the requested time range
    @Query("""
        SELECT b FROM Booking b
        WHERE b.facility.id = :facilityId
          AND b.status IN ('PENDING', 'APPROVED')
          AND b.id <> :excludeId
          AND b.startAt < :endAt
          AND b.endAt   > :startAt
    """)
    List<Booking> findConflicts(
        @Param("facilityId") Long facilityId,
        @Param("startAt")    LocalDateTime startAt,
        @Param("endAt")      LocalDateTime endAt,
        @Param("excludeId")  Long excludeId
    );
}