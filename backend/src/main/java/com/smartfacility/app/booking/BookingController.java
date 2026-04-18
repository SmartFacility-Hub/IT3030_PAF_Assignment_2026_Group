package com.smartfacility.app.booking;

import com.smartfacility.app.booking.dto.BookingRequestDTO;
import com.smartfacility.app.booking.dto.BookingResponseDTO;
import com.smartfacility.app.booking.dto.BookingUpdateDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        return ResponseEntity.ok(bookingService.getMyBookings(email));
    }

    @PostMapping
    public ResponseEntity<BookingResponseDTO> create(Authentication authentication,
                                                     @Valid @RequestBody BookingRequestDTO dto) {
        String email = (String) authentication.getPrincipal();
        BookingResponseDTO created = bookingService.create(email, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> update(Authentication authentication,
                                                     @PathVariable Long id,
                                                     @Valid @RequestBody BookingUpdateDTO dto) {
        String email = (String) authentication.getPrincipal();
        return ResponseEntity.ok(bookingService.update(email, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(Authentication authentication, @PathVariable Long id) {
        String email = (String) authentication.getPrincipal();
        bookingService.cancel(email, id);
        return ResponseEntity.ok(Map.of("message", "Booking cancelled"));
    }
}

