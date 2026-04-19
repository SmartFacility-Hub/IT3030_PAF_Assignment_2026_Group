package com.smartfacility.app.incidentservice.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String messsage){
        super(messsage);
    }
}
