package com.smartfacility.app.BookingManagement.repository;

import com.smartfacility.app.BookingManagement.enums.BookingStatus;
import com.smartfacility.app.BookingManagement.model.Booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
            SELECT b FROM Booking b WHERE b.resourceId = :resourceId
            AND b.bookingDate = :date
            AND b.status NOT IN ('REJECTED', 'CANCELLED')
            AND b.startTime < :endTime
            AND b.endTime > :startTime
            """)
    List<Booking> findConflictingBookings(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    List<Booking> findByUserIdOrderByBookingDateDescStartTimeDesc(String userId);

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByBookingDateOrderByStartTimeAsc(LocalDate date);
}
