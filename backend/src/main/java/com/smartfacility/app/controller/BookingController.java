package com.smartfacility.app.controller;

import com.smartfacility.app.model.BookingStatus;
import com.smartfacility.app.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // ── USER: Create booking ──────────────────────────────────────

    /**
     * POST /api/bookings
     * Body: { facilityId, startAt, endAt, purpose, expectedAttendees }
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> body,
                                            Authentication auth) {
        String email = (String) auth.getPrincipal();
        try {
            Long    facilityId         = Long.valueOf(body.get("facilityId").toString());
            LocalDateTime startAt      = LocalDateTime.parse(body.get("startAt").toString());
            LocalDateTime endAt        = LocalDateTime.parse(body.get("endAt").toString());
            String  purpose            = body.containsKey("purpose") ? body.get("purpose").toString() : null;
            Integer expectedAttendees  = body.containsKey("expectedAttendees") && body.get("expectedAttendees") != null
                                         ? Integer.valueOf(body.get("expectedAttendees").toString()) : null;

            var booking = bookingService.createBooking(
                email, facilityId, startAt, endAt, purpose, expectedAttendees);

            Map<String, Object> response = bookingService.toResponse(booking);
            response.put("message", "Booking request submitted successfully.");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request data."));
        }
    }

    // ── USER: View own bookings ───────────────────────────────────

    /**
     * GET /api/bookings/my
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<Map<String, Object>> result = bookingService
            .getMyBookings(email)
            .stream()
            .map(bookingService::toResponse)
            .toList();
        return ResponseEntity.ok(result);
    }

    // ── USER: Update own PENDING booking ─────────────────────────

    /**
     * PUT /api/bookings/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Long id,
                                            @RequestBody Map<String, Object> body,
                                            Authentication auth) {
        String email = (String) auth.getPrincipal();
        try {
            LocalDateTime startAt     = LocalDateTime.parse(body.get("startAt").toString());
            LocalDateTime endAt       = LocalDateTime.parse(body.get("endAt").toString());
            String  purpose           = body.containsKey("purpose") ? body.get("purpose").toString() : null;
            Integer expectedAttendees = body.containsKey("expectedAttendees") && body.get("expectedAttendees") != null
                                        ? Integer.valueOf(body.get("expectedAttendees").toString()) : null;

            var booking = bookingService.updateBooking(
                email, id, startAt, endAt, purpose, expectedAttendees);

            Map<String, Object> response = bookingService.toResponse(booking);
            response.put("message", "Booking updated successfully.");
            return ResponseEntity.ok(response);

        } catch (org.springframework.web.server.ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request data."));
        }
    }

    // ── USER: Cancel own booking ──────────────────────────────────

    /**
     * DELETE /api/bookings/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id,
                                            Authentication auth) {
        String email = (String) auth.getPrincipal();
        var booking = bookingService.cancelBooking(email, id);
        Map<String, Object> response = bookingService.toResponse(booking);
        response.put("message", "Booking cancelled successfully.");
        return ResponseEntity.ok(response);
    }

    // ── ADMIN: View all bookings ──────────────────────────────────

    /**
     * GET /api/bookings/admin/all?status=PENDING
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        List<Map<String, Object>> result = bookingService
            .getAllBookings(status)
            .stream()
            .map(bookingService::toResponse)
            .toList();
        return ResponseEntity.ok(result);
    }

    // ── ADMIN: Approve booking ────────────────────────────────────

    /**
     * PUT /api/bookings/admin/{id}/approve
     */
    @PutMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveBooking(@PathVariable Long id,
                                             Authentication auth) {
        String adminEmail = (String) auth.getPrincipal();
        var booking = bookingService.approveBooking(adminEmail, id);
        Map<String, Object> response = bookingService.toResponse(booking);
        response.put("message", "Booking approved.");
        return ResponseEntity.ok(response);
    }

    // ── ADMIN: Reject booking ─────────────────────────────────────

    /**
     * PUT /api/bookings/admin/{id}/reject
     * Body: { "reason": "..." }
     */
    @PutMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id,
                                            @RequestBody Map<String, String> body,
                                            Authentication auth) {
        String adminEmail = (String) auth.getPrincipal();
        String reason = body.getOrDefault("reason", "No reason provided.");
        var booking = bookingService.rejectBooking(adminEmail, id, reason);
        Map<String, Object> response = bookingService.toResponse(booking);
        response.put("message", "Booking rejected.");
        return ResponseEntity.ok(response);
    }
}