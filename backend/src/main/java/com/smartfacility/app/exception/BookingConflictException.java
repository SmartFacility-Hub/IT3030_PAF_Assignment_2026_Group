package com.smartfacility.app.exception;

public class BookingConflictException extends RuntimeException {

    public BookingConflictException() {
        super("A booking already exists for this resource at the selected time");
    }
}
