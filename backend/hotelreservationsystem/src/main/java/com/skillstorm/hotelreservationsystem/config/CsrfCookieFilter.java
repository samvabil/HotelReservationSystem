package com.skillstorm.hotelreservationsystem.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that ensures CSRF tokens are written to cookies for frontend consumption.
 * <p>
 * This filter forces the CSRF token to be rendered by accessing it, which triggers
 * the CsrfTokenRepository to write the "XSRF-TOKEN" cookie to the response.
 * This allows JavaScript-based frontends to read the token and include it in requests.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
public class CsrfCookieFilter extends OncePerRequestFilter {

    /**
     * Forces CSRF token to be written to cookie by accessing the token.
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
        
        // 1. Force the loading of the CsrfToken
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        
        // 2. If the token exists, render it. 
        // This invokes the CsrfTokenRepository to write the "XSRF-TOKEN" cookie to the response.
        if (csrfToken != null) {
            csrfToken.getToken();
        }

        filterChain.doFilter(request, response);
    }
}