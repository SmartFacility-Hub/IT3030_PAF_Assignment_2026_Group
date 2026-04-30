package com.smartfacility.app.service;

import com.smartfacility.app.model.*;
import com.smartfacility.app.repository.BookingRepository;
import com.smartfacility.app.repository.FacilityRepository;
import com.smartfacility.app.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
public class BookingService {

    private final BookingRepository  bookingRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository     userRepository;

    public BookingService(BookingRepository bookingRepository,
                          FacilityRepository facilityRepository,
                          UserRepository userRepository) {
        this.bookingRepository  = bookingRepository;
        this.facilityRepository = facilityRepository;
        this.userRepository     = userRepository;
    }

    // ─────────────────────────────────────────────────────────────
    // USER: Create booking
    // ─────────────────────────────────────────────────────────────
    public Booking createBooking(String userEmail, Long facilityId,
                                 LocalDateTime startAt, LocalDateTime endAt,
                                 String purpose, Integer expectedAttendees) {

        // 1. Validate times
        if (!endAt.isAfter(startAt)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "End time must be after start time.");
        }
        if (startAt.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Start time cannot be in the past.");
        }

        // 2. Load user & facility
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        Facility facility = facilityRepository.findById(facilityId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found."));

        if (facility.getStatus() != FacilityStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Facility is not available for booking.");
        }

        // 3. Conflict check
        List<Booking> conflicts = bookingRepository.findConflicts(
            facilityId, startAt, endAt, -1L);

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "This facility is already booked for the selected time range.");
        }

        // 4. Create
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setFacility(facility);
        booking.setStartAt(startAt);
        booking.setEndAt(endAt);
        booking.setPurpose(purpose);
        booking.setExpectedAttendees(expectedAttendees);
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────────────────────
    // USER: Update own PENDING booking
    // ─────────────────────────────────────────────────────────────
    public Booking updateBooking(String userEmail, Long bookingId,
                                 LocalDateTime startAt, LocalDateTime endAt,
                                 String purpose, Integer expectedAttendees) {

        Booking booking = getBookingOwnedBy(userEmail, bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only PENDING bookings can be edited.");
        }
        if (!endAt.isAfter(startAt)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "End time must be after start time.");
        }

        // Conflict check (exclude self)
        List<Booking> conflicts = bookingRepository.findConflicts(
            booking.getFacility().getId(), startAt, endAt, bookingId);

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "This facility is already booked for the selected time range.");
        }

        booking.setStartAt(startAt);
        booking.setEndAt(endAt);
        booking.setPurpose(purpose);
        booking.setExpectedAttendees(expectedAttendees);

        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────────────────────
    // USER: Cancel own booking
    // ─────────────────────────────────────────────────────────────
    public Booking cancelBooking(String userEmail, Long bookingId) {
        Booking booking = getBookingOwnedBy(userEmail, bookingId);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Booking is already cancelled.");
        }
        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cannot cancel a rejected booking.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────────────────────
    // USER: View own bookings
    // ─────────────────────────────────────────────────────────────
    public List<Booking> getMyBookings(String userEmail) {
        return bookingRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN: View all bookings (with optional status filter)
    // ─────────────────────────────────────────────────────────────
    public List<Booking> getAllBookings(BookingStatus status) {
        if (status != null) {
            return bookingRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN: Approve booking
    // ─────────────────────────────────────────────────────────────
    public Booking approveBooking(String adminEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Booking not found."));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only PENDING bookings can be approved.");
        }

        // Final conflict check before approving
        List<Booking> conflicts = bookingRepository.findConflicts(
            booking.getFacility().getId(),
            booking.getStartAt(), booking.getEndAt(), bookingId);

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cannot approve — a conflicting booking already exists.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedBy(adminEmail);
        booking.setReviewedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN: Reject booking
    // ─────────────────────────────────────────────────────────────
    public Booking rejectBooking(String adminEmail, Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Booking not found."));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only PENDING bookings can be rejected.");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setReviewedBy(adminEmail);
        booking.setReviewedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    // ─────────────────────────────────────────────────────────────
    // Helper: convert Booking → response map
    // ─────────────────────────────────────────────────────────────
    public Map<String, Object> toResponse(Booking b) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",                 b.getId());
        map.put("facilityId",         b.getFacility().getId());
        map.put("facilityName",       b.getFacility().getName());
        map.put("facilityType",       b.getFacility().getType());
        map.put("location",           b.getFacility().getLocation());
        map.put("bookedBy",           b.getUser().getName());
        map.put("bookedByEmail",      b.getUser().getEmail());
        map.put("startAt",            b.getStartAt());
        map.put("endAt",              b.getEndAt());
        map.put("purpose",            b.getPurpose());
        map.put("expectedAttendees",  b.getExpectedAttendees());
        map.put("status",             b.getStatus());
        map.put("rejectionReason",    b.getRejectionReason());
        map.put("reviewedBy",         b.getReviewedBy());
        map.put("reviewedAt",         b.getReviewedAt());
        map.put("createdAt",          b.getCreatedAt());
        map.put("updatedAt",          b.getUpdatedAt());
        return map;
    }

    // ─────────────────────────────────────────────────────────────
    // Private helper
    // ─────────────────────────────────────────────────────────────
    private Booking getBookingOwnedBy(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Booking not found."));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "You do not own this booking.");
        }
        return booking;
    }
}