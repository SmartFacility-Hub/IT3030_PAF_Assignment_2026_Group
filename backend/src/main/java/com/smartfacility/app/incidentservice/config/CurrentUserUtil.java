package com.smartfacility.app.incidentservice.config;

import org.springframework.stereotype.Component;

@Component
public class CurrentUserUtil {
    // Temporary: returns hardcoded user
    // Day 3: replace this with real JWT extraction
    public String getCurrentUserId() {
        return "user_001";
    }

    public String getCurrentUserRole() {
        return "ADMIN"; // change to "USER" to test user restrictions
    }

    public boolean isAdmin() {
        return "ADMIN".equals(getCurrentUserRole());
    }
}
