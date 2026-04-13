package com.smartfacility.app.incidentservice.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message){
        super(message);
    }
}
