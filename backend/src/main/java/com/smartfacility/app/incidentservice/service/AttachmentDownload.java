package com.smartfacility.app.incidentservice.service;

import org.springframework.core.io.Resource;

public record AttachmentDownload(Resource resource, String contentType) {
}
