package com.smartfacility.app.security;

import com.smartfacility.app.model.ERole;
import com.smartfacility.app.model.Role;
import com.smartfacility.app.model.User;
import com.smartfacility.app.repository.RoleRepository;
import com.smartfacility.app.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserRepository userRepository,
                                 RoleRepository roleRepository,
                                 JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                         HttpServletResponse response,
                                         Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String googleId = oAuth2User.getAttribute("sub");

        // Find or create user
        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    User newUser = new User(email, name, picture, googleId);

                    // Assign default ROLE_USER
                    Set<Role> roles = new HashSet<>();
                    roleRepository.findByName(ERole.ROLE_USER).ifPresent(roles::add);
                    newUser.setRoles(roles);

                    return userRepository.save(newUser);
                });

        // Update profile info on each login
        user.setName(name);
        user.setPicture(picture);
        user.setEmail(email);
        userRepository.save(user);

        // Generate JWT
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .toList();

        String token = jwtUtils.generateToken(email, name, picture, user.getId(), roles);

        // Redirect to frontend with token
        response.sendRedirect(frontendUrl + "/oauth2/callback?token=" + token);
    }
}
