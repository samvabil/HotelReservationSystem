package com.skillstorm.hotelreservationsystem.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value; // Import this!
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class UserFrontendRedirectSuccessHandler implements AuthenticationSuccessHandler {

    // Inject the URL from your application.yml / application-prod.yml
    @Value("${app.cors.allowed-origins}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                        HttpServletResponse response, 
                                        Authentication authentication) throws IOException, ServletException {
        
        // Use the injected variable + the specific path
        String targetUrl = frontendUrl + "/login-success?status=success";
        
        response.sendRedirect(targetUrl);
    }
}