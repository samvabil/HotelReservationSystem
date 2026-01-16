package com.skillstorm.hotelreservationsystem.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value; // Import this!
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Custom authentication success handler for OAuth2 user login.
 * <p>
 * After successful OAuth2 authentication (e.g., Google login), this handler
 * redirects users to the frontend application's login success page instead of
 * a default Spring Security success page.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Component
public class UserFrontendRedirectSuccessHandler implements AuthenticationSuccessHandler {

    /**
     * The frontend URL injected from application properties.
     * Used to construct the redirect URL after successful authentication.
     */
    @Value("${app.cors.allowed-origins}")
    private String frontendUrl;

    /**
     * Handles successful authentication by redirecting to the frontend login success page.
     *
     * @param request The HTTP servlet request.
     * @param response The HTTP servlet response.
     * @param authentication The authentication object representing the authenticated user.
     * @throws IOException If an I/O error occurs during redirect.
     * @throws ServletException If a servlet error occurs.
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                        HttpServletResponse response, 
                                        Authentication authentication) throws IOException, ServletException {
        
        // Use the injected variable + the specific path
        String targetUrl = frontendUrl + "/login-success?status=success";
        
        response.sendRedirect(targetUrl);
    }
}