package com.smartfacility.app.service;

import com.smartfacility.app.dto.BookingRequestDTO;
import com.smartfacility.app.dto.BookingResponseDTO;
import com.smartfacility.app.enums.BookingStatus;
import com.smartfacility.app.exception.BookingConflictException;
import com.smartfacility.app.exception.BookingNotFoundException;
import com.smartfacility.app.model.Booking;
import com.smartfacility.app.model.Facility;
import com.smartfacility.app.model.FacilityType;
import com.smartfacility.app.model.User;
import com.smartfacility.app.repository.BookingRepository;
import com.smartfacility.app.repository.FacilityRepository;
import com.smartfacility.app.repository.UserRepository;
import com.smartfacility.app.model.Role;
import com.smartfacility.app.model.ERole;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;

    /**
     * Always resolve the acting user from the DB using the JWT email principal (single source of truth).
     */
    private User requireUserFromEmail(String authenticatedEmail) {
        if (!StringUtils.hasText(authenticatedEmail)) {
            throw new IllegalStateException("Not authenticated");
        }
        String email = authenticatedEmail.trim().toLowerCase(Locale.ROOT);
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found for this email"));
    }

    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO dto, String authenticatedEmail) {
        User owner = requireUserFromEmail(authenticatedEmail);
        String userId = String.valueOf(owner.getId());
        String userName = owner.getName();

        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (dto.getBookingDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date cannot be in the past");
        }

        facilityRepository.findById(dto.getResourceId()).ifPresent(facility -> {
            validateCapacityForFacility(facility, dto.getExpectedAttendees());

            if (StringUtils.hasText(facility.getAvailabilityStart()) && StringUtils.hasText(facility.getAvailabilityEnd())) {
                try {
                    java.time.LocalTime facilityStart = java.time.LocalTime.parse(facility.getAvailabilityStart());
                    java.time.LocalTime facilityEnd = java.time.LocalTime.parse(facility.getAvailabilityEnd());
                    
                    if (dto.getStartTime().isBefore(facilityStart) || dto.getEndTime().isAfter(facilityEnd)) {
                        throw new IllegalArgumentException("Booking time falls outside the facility's available hours of " 
                                + facility.getAvailabilityStart() + " to " + facility.getAvailabilityEnd());
                    }
                } catch (java.time.format.DateTimeParseException e) {
                    // Ignore parse exception if DB has invalid format
                }
            }
        });

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                dto.getResourceId(),
                dto.getBookingDate(),
                dto.getStartTime(),
                dto.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                "This facility is already booked from " +
                conflicts.get(0).getStartTime() + " to " +
                conflicts.get(0).getEndTime() + 
                " on " + dto.getBookingDate() +
                ". Please choose a different time slot."
            );
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
    public List<BookingResponseDTO> getMyBookings(String authenticatedEmail) {
        User owner = requireUserFromEmail(authenticatedEmail);
        String userId = String.valueOf(owner.getId());
        String email = owner.getEmail() == null ? "" : owner.getEmail().trim().toLowerCase(Locale.ROOT);
        return bookingRepository.findMineForUser(userId, email).stream()
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
    public BookingResponseDTO cancelBooking(Long id, String authenticatedEmail) {
        User owner = requireUserFromEmail(authenticatedEmail);
        String userId = String.valueOf(owner.getId());
        String userEmail = owner.getEmail();

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only PENDING or APPROVED bookings can be cancelled");
        }
        if (!isBookingOwner(booking, userId, userEmail)) {
            throw new IllegalStateException("Users can only cancel their own bookings");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public void deleteBooking(Long id, String authenticatedEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));

        User owner = requireUserFromEmail(authenticatedEmail);
        String currentUserId = String.valueOf(owner.getId());
        
        boolean isAdmin = owner.getRoles().stream()
                .anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);

        if (isAdmin) {
            // Admin can only delete CANCELLED bookings
            if (booking.getStatus() != BookingStatus.CANCELLED) {
                throw new IllegalStateException("Admin can only delete CANCELLED bookings");
            }
        } else {
            // User can only delete their own PENDING bookings
            // within 10 minutes of creation
            if (!isBookingOwner(booking, currentUserId, owner.getEmail())) {
                throw new IllegalStateException("You can only delete your own bookings");
            }
            if (booking.getStatus() != BookingStatus.PENDING) {
                throw new IllegalStateException("You can only delete PENDING bookings");
            }
            // Check 10 minute window from createdAt
            LocalDateTime tenMinutesAfterCreation = booking.getCreatedAt().plusMinutes(10);
            if (LocalDateTime.now().isAfter(tenMinutesAfterCreation)) {
                throw new IllegalStateException(
                    "Booking can only be deleted within 10 minutes of creation. " +
                    "Please cancel it instead."
                );
            }
        }

        bookingRepository.delete(booking);
    }

    private void validateCapacityForFacility(Facility facility, int expectedAttendees) {
        if (facility.getType() == FacilityType.EQUIPMENT) {
            return;
        }
        Integer cap = facility.getCapacity();
        if (cap == null) {
            return;
        }
        if (expectedAttendees > cap) {
            throw new IllegalArgumentException(
                    "Expected attendees exceeds facility capacity of " + cap + " for " + facility.getName());
        }
    }

    private boolean isBookingOwner(Booking booking, String userId, String userEmail) {
        if (userId != null && userId.equals(booking.getUserId())) {
            return true;
        }
        if (userEmail != null && userEmail.trim().equalsIgnoreCase(booking.getUserId())) {
            return true;
        }
        return false;
    }

    private String resolveDisplayUserName(Booking booking) {
        String stored = booking.getUserName();
        String uid = booking.getUserId();
        if (!StringUtils.hasText(uid)) {
            return stored;
        }
        try {
            long id = Long.parseLong(uid.trim());
            return userRepository.findById(id).map(User::getName).orElse(stored);
        } catch (NumberFormatException ex) {
            return userRepository.findByEmailIgnoreCase(uid.trim()).map(User::getName).orElse(stored);
        }
    }

    private BookingResponseDTO toResponse(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .resourceName(booking.getResourceName())
                .userId(booking.getUserId())
                .userName(resolveDisplayUserName(booking))
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
