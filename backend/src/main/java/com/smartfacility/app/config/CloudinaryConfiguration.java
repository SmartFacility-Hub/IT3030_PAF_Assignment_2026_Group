package com.smartfacility.app.config;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import com.cloudinary.Cloudinary;

@Configuration
public class CloudinaryConfiguration {

    /**
     * Registers Cloudinary only when cloud name, API key, and API secret are set.
     * Use environment variables CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (never commit secrets).
     */
    @Bean
    public Cloudinary cloudinary(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret) {
        if (!StringUtils.hasText(cloudName)
                || !StringUtils.hasText(apiKey)
                || !StringUtils.hasText(apiSecret)) {
            return null;
        }
        return new Cloudinary(Map.of(
                "cloud_name", cloudName.trim(),
                "api_key", apiKey.trim(),
                "api_secret", apiSecret.trim()));
    }
}
