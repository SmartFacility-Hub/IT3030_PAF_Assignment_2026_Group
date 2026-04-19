package com.smartfacility.app.booking;

import com.smartfacility.app.booking.dto.BookingRequestDTO;
import com.smartfacility.app.booking.dto.BookingResponseDTO;
import com.smartfacility.app.booking.dto.BookingUpdateDTO;
import com.smartfacility.app.model.Facility;
import com.smartfacility.app.repository.FacilityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;

    public BookingService(BookingRepository bookingRepository, FacilityRepository facilityRepository) {
        this.bookingRepository = bookingRepository;
        this.facilityRepository = facilityRepository;
    }

    public List<BookingResponseDTO> getMyBookings(String userEmail) {
        return bookingRepository.findByUserEmailOrderByStartAtDesc(userEmail)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public BookingResponseDTO create(String userEmail, BookingRequestDTO dto) {
        if (dto.getStartAt() == null || dto.getEndAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startAt and endAt are required");
        }
        if (!dto.getEndAt().isAfter(dto.getStartAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endAt must be after startAt");
        }

        Facility facility = facilityRepository.findById(dto.getFacilityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found"));

        Booking booking = new Booking();
        booking.setUserEmail(userEmail);
        booking.setFacility(facility);
        booking.setStartAt(dto.getStartAt());
        booking.setEndAt(dto.getEndAt());
        booking.setPurpose(dto.getPurpose());
        booking.setStatus(BookingStatus.PENDING);

        return toDto(bookingRepository.save(booking));
    }

    public BookingResponseDTO update(String userEmail, Long bookingId, BookingUpdateDTO dto) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserEmail().equalsIgnoreCase(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is cancelled");
        }

        LocalDateTime startAt = dto.getStartAt();
        LocalDateTime endAt = dto.getEndAt();
        if (startAt == null || endAt == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startAt and endAt are required");
        }
        if (!endAt.isAfter(startAt)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endAt must be after startAt");
        }

        booking.setStartAt(startAt);
        booking.setEndAt(endAt);
        booking.setPurpose(dto.getPurpose());

        return toDto(bookingRepository.save(booking));
    }

    public void cancel(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserEmail().equalsIgnoreCase(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingResponseDTO toDto(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(booking.getId());
        dto.setFacilityId(booking.getFacility().getId());
        dto.setFacilityName(booking.getFacility().getName());
        dto.setFacilityType(booking.getFacility().getType().name());
        dto.setLocation(booking.getFacility().getLocation());
        dto.setStartAt(booking.getStartAt());
        dto.setEndAt(booking.getEndAt());
        dto.setPurpose(booking.getPurpose());
        dto.setStatus(booking.getStatus());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}

