package com.smartfacility.app.incidentservice.util;

import org.springframework.util.StringUtils;

import com.smartfacility.app.incidentservice.model.TicketAttachment;

public final class AttachmentDownloadUrls {

    private AttachmentDownloadUrls() {
    }

    public static String build(TicketAttachment a, long ticketId) {
        if (StringUtils.hasText(a.getCloudinaryUrl())) {
            return a.getCloudinaryUrl().trim();
        }
        return "/api/tickets/" + ticketId + "/attachments/" + a.getId() + "/download";
    }
}
