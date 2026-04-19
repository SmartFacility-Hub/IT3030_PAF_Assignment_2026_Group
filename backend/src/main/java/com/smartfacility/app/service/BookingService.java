package com.smartfacility.app.service;

import java.time.LocalDate;
import java.util.List;

import com.smartfacility.app.dto.BookingRequestDTO;
import com.smartfacility.app.dto.BookingResponseDTO;

public interface BookingService {

    /**
     * Creates a booking for the user identified by {@code authenticatedEmail} (JWT subject, normalized).
     * Owner id and display name are always loaded from the database inside the service — never passed from the controller.
     */
    BookingResponseDTO createBooking(BookingRequestDTO dto, String authenticatedEmail);

    BookingResponseDTO getBookingById(Long id);

    List<BookingResponseDTO> getMyBookings(String authenticatedEmail);

    List<BookingResponseDTO> getAllBookings(String status, Long resourceId, LocalDate date);

    BookingResponseDTO approveBooking(Long id);

    BookingResponseDTO rejectBooking(Long id, String reason);

    BookingResponseDTO cancelBooking(Long id, String authenticatedEmail);

    void deleteBooking(Long id, String authenticatedEmail);
}
