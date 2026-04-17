package com.smartfacility.app.BookingManagement.exception;

public class BookingNotFoundException extends RuntimeException {

    public BookingNotFoundException(Long id) {
        super("Booking not found with id: " + id);
    }
}
