package com.smartfacility.app.BookingManagement.service;

import com.smartfacility.app.BookingManagement.dto.BookingRequestDTO;
import com.smartfacility.app.BookingManagement.dto.BookingResponseDTO;
import com.smartfacility.app.BookingManagement.enums.BookingStatus;
import com.smartfacility.app.BookingManagement.exception.BookingConflictException;
import com.smartfacility.app.BookingManagement.exception.BookingNotFoundException;
import com.smartfacility.app.BookingManagement.model.Booking;
import com.smartfacility.app.BookingManagement.repository.BookingRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO dto, String userId, String userName) {
        if (dto.getEndTime() == null || dto.getStartTime() == null || !dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                dto.getResourceId(),
                dto.getBookingDate(),
                dto.getStartTime(),
                dto.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException();
        }

        Booking booking = Booking.builder()
                .resourceId(dto.getResourceId())
                .resourceName(dto.getResourceName())
                .userId(userId)
                .userName(userName)
                .bookingDate(dto.getBookingDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));
        return toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getMyBookings(String userId) {
        return bookingRepository.findByUserIdOrderByBookingDateDescStartTimeDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings(String status, Long resourceId, LocalDate date) {
        List<Booking> bookings;

        if (StringUtils.hasText(status)) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase(Locale.ROOT));
            bookings = bookingRepository.findByStatusOrderByCreatedAtDesc(bookingStatus);
        } else if (date != null) {
            bookings = bookingRepository.findByBookingDateOrderByStartTimeAsc(date);
        } else {
            bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        }

        if (resourceId != null) {
            bookings = bookings.stream()
                    .filter(b -> resourceId.equals(b.getResourceId()))
                    .toList();
        }

        return bookings.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BookingResponseDTO approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponseDTO rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be rejected");
        }
        if (!StringUtils.hasText(reason)) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Long id, String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only PENDING or APPROVED bookings can be cancelled");
        }
        if (!booking.getUserId().equals(userId)) {
            throw new IllegalStateException("Users can only cancel their own bookings");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }

    private BookingResponseDTO toResponse(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .resourceName(booking.getResourceName())
                .userId(booking.getUserId())
                .userName(booking.getUserName())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus().name())
                .rejectionReason(booking.getRejectionReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
