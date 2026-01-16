package com.skillstorm.hotelreservationsystem.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Security filter that enforces CloudFront authentication header validation.
 * <p>
 * This filter prevents direct access to the backend by requiring a secret header
 * that CloudFront adds to requests. Health check endpoints are exempt from this check.
 * In local development, the check can be disabled by leaving the secret empty.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Component
public class CloudFrontSecurityFilter extends OncePerRequestFilter {

    /**
     * The expected secret value from the X-CF-Auth header.
     * Injected from application properties (defaults to empty string for local dev).
     */
    @Value("${cloudfront.secret:}") 
    private String expectedSecret;

    /**
     * Filters incoming requests to validate CloudFront authentication header.
     * <p>
     * Allows health check endpoints to pass through without validation.
     * For all other requests, validates the X-CF-Auth header matches the expected secret.
     * </p>
     *
     * @param request The HTTP servlet request.
     * @param response The HTTP servlet response.
     * @param filterChain The filter chain to continue processing.
     * @throws ServletException If a servlet error occurs.
     * @throws IOException If an I/O error occurs.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. SKIP CHECK FOR HEALTH CHECKS
        // The AWS Load Balancer performs health checks on "/" or "/actuator/health".
        // It does NOT have the secret header, so we must let it pass, or the instance will be marked unhealthy.
        String path = request.getRequestURI();
        if (path.equals("/") ||path.equals("/api") ||path.equals("/api/") || path.startsWith("/actuator") || path.equals("/health")) {
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