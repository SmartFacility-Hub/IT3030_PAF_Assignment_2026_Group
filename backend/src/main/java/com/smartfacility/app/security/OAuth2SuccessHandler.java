package com.smartfacility.app.security;

import com.smartfacility.app.model.User;
import com.smartfacility.app.service.UserProvisioningService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;


@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserProvisioningService userProvisioningService;
    private final JwtUtils jwtUtils;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserProvisioningService userProvisioningService,
                                JwtUtils jwtUtils) {
        this.userProvisioningService = userProvisioningService;
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

        User user = userProvisioningService.provisionFromGoogle(email, name, picture, googleId);

        // Generate JWT
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .toList();

        String token = jwtUtils.generateToken(user.getEmail(), user.getName(), user.getPicture(), user.getId(), roles);

        // Redirect to frontend with token
        response.sendRedirect(frontendUrl + "/oauth2/callback?token=" + token);
    }
}
