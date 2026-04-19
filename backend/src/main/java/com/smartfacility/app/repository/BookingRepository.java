package com.smartfacility.app.repository;

import com.smartfacility.app.enums.BookingStatus;
import com.smartfacility.app.model.Booking;

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

    /**
     * Bookings owned by the signed-in user: {@code userId} is the numeric user id string;
     * {@code email} matches legacy rows that stored the email in {@code userId}.
     */
    @Query("""
            SELECT b FROM Booking b
            WHERE b.userId = :userId OR LOWER(TRIM(b.userId)) = LOWER(TRIM(:email))
            ORDER BY b.bookingDate DESC, b.startTime DESC
            """)
    List<Booking> findMineForUser(@Param("userId") String userId, @Param("email") String email);

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByBookingDateOrderByStartTimeAsc(LocalDate date);
}
