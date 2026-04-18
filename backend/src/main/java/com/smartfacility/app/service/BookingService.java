package com.smartfacility.app.service;

import java.time.LocalDate;
import java.util.List;

import com.smartfacility.app.dto.BookingRequestDTO;
import com.smartfacility.app.dto.BookingResponseDTO;

public interface BookingService {

    BookingResponseDTO createBooking(BookingRequestDTO dto, String userId, String userName);

    BookingResponseDTO getBookingById(Long id);

    List<BookingResponseDTO> getMyBookings(String userId);

    List<BookingResponseDTO> getAllBookings(String status, Long resourceId, LocalDate date);

    BookingResponseDTO approveBooking(Long id);

    BookingResponseDTO rejectBooking(Long id, String reason);

    BookingResponseDTO cancelBooking(Long id, String userId);
}
