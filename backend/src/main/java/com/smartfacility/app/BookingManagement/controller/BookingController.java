package com.smartfacility.app.BookingManagement.controller;

import com.smartfacility.app.BookingManagement.dto.BookingRequestDTO;
import com.smartfacility.app.BookingManagement.dto.BookingResponseDTO;
import com.smartfacility.app.BookingManagement.service.BookingService;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ENDPOINT: POST /api/bookings
    // ACCESS: Authenticated users
    // CONNECTS TO: BookingService.createBooking()
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO dto) {
        String userId = "user-001";
        String userName = "Test User";
        BookingResponseDTO response = bookingService.createBooking(dto, userId, userName);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ENDPOINT: GET /api/bookings/my
    // ACCESS: Authenticated users
    // CONNECTS TO: BookingService.getMyBookings()
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings() {
        String userId = "user-001";
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    // ENDPOINT: GET /api/bookings
    // ACCESS: Admin users
    // CONNECTS TO: BookingService.getAllBookings()
    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, resourceId, date));
    }

    // ENDPOINT: GET /api/bookings/{id}
    // ACCESS: Authenticated users and admins
    // CONNECTS TO: BookingService.getBookingById()
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // ENDPOINT: PUT /api/bookings/{id}/approve
    // ACCESS: Admin users
    // CONNECTS TO: BookingService.approveBooking()
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingResponseDTO> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    // ENDPOINT: PUT /api/bookings/{id}/reject
    // ACCESS: Admin users
    // CONNECTS TO: BookingService.rejectBooking()
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String reason = body == null ? null : body.get("reason");
        if (!StringUtils.hasText(reason)) {
            throw new IllegalArgumentException("reason is required");
        }
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
    }

    // ENDPOINT: PUT /api/bookings/{id}/cancel
    // ACCESS: Authenticated users
    // CONNECTS TO: BookingService.cancelBooking()
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id) {
        String userId = "user-001";
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }
}
