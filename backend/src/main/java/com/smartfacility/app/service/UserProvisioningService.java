package com.smartfacility.app.service;

import com.smartfacility.app.model.ERole;
import com.smartfacility.app.model.Role;
import com.smartfacility.app.model.User;
import com.smartfacility.app.repository.RoleRepository;
import com.smartfacility.app.repository.UserRepository;
import java.util.HashSet;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Resolves or creates {@link User} rows from Google identity so we never create a duplicate
 * when the same person already exists by email (common cause of wrong JWT user id vs bookings).
 */
@Service
@RequiredArgsConstructor
public class UserProvisioningService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public User provisionFromGoogle(String rawEmail, String name, String picture, String googleSubject) {
        if (!StringUtils.hasText(googleSubject)) {
            throw new IllegalArgumentException("Google account id (sub) is required");
        }
        String email = normalizeEmail(rawEmail);
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email is required from Google account");
        }

        Optional<User> byGoogle = userRepository.findByGoogleId(googleSubject);
        if (byGoogle.isPresent()) {
            User u = byGoogle.get();
            u.setEmail(email);
            u.setName(name);
            u.setPicture(picture);
            return userRepository.save(u);
        }

        Optional<User> byEmail = userRepository.findByEmailIgnoreCase(email);
        if (byEmail.isPresent()) {
            User u = byEmail.get();
            u.setGoogleId(googleSubject);
            u.setEmail(email);
            u.setName(name);
            u.setPicture(picture);
            return userRepository.save(u);
        }

        User fresh = new User(email, name, picture, googleSubject);
        Set<Role> roles = new HashSet<>();
        roleRepository.findByName(ERole.ROLE_USER).ifPresent(roles::add);
        fresh.setRoles(roles);
        return userRepository.save(fresh);
    }

    private static String normalizeEmail(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.trim().toLowerCase(Locale.ROOT);
    }
}
