package com.smartfacility.app.incidentservice.exception;

public class UnauthorizedException extends RuntimeException  {
    public UnauthorizedException(String message){
        super(message);
    }
}
