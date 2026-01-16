package com.skillstorm.hotelreservationsystem.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class CloudFrontSecurityFilter extends OncePerRequestFilter {

    // Inject the secret from application.properties / Env Var
    // In local dev, you can default to "" or skip the check
    @Value("${cloudfront.secret:}") 
    private String expectedSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. SKIP CHECK FOR HEALTH CHECKS
        // The AWS Load Balancer performs health checks on "/" or "/actuator/health".
        // It does NOT have the secret header, so we must let it pass, or the instance will be marked unhealthy.
        String path = request.getRequestURI();
        if (path.equals("/") || path.startsWith("/actuator") || path.equals("/health")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. CHECK FOR SECRET
        // If the secret is set in the environment, we enforce it.
        // If it's empty (like on localhost), we skip enforcement.
        if (expectedSecret != null && !expectedSecret.isEmpty()) {
            String incomingSecret = request.getHeader("X-CF-Auth");

            if (incomingSecret == null || !incomingSecret.equals(expectedSecret)) {
                // REJECT
                System.out.println("Blocked direct access attempt from IP: " + request.getRemoteAddr());
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: Direct access not allowed.");
                return;
            }
        }

        // 3. ALLOW
        filterChain.doFilter(request, response);
    }
}