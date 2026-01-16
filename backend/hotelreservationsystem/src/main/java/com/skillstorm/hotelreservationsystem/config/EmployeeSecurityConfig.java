package com.skillstorm.hotelreservationsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Security configuration for employee authentication and authorization.
 * <p>
 * This configuration uses Order(1) to have higher priority than UserSecurityConfig.
 * It handles security for all endpoints under "/api/employees/**" using Basic Authentication
 * and session-based authentication with CSRF protection.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Configuration
@Order(1)
public class EmployeeSecurityConfig {

    /**
     * Defines the security filter chain for employee endpoints.
     * <p>
     * Configures Basic Authentication, CSRF protection, session management,
     * and role-based access control for employee and admin operations.
     * </p>
     *
     * @param http The HttpSecurity builder.
     * @return The built SecurityFilterChain for employee endpoints.
     * @throws Exception If an error occurs during configuration.
     */
    @Bean
    public SecurityFilterChain employeeFilterChain(HttpSecurity http) throws Exception {

        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        http
            // Only applies to employee API paths
            .securityMatcher("/api/employees/**")

            // CSRF enabled, but ignore the bootstrap session endpoint
            .csrf(csrf -> {
                // 1. Create the repo and fix the path for the /api architecture
                CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
                repository.setCookiePath("/"); 

                csrf.csrfTokenRepository(repository)
                    .csrfTokenRequestHandler(requestHandler)
                    // 2. Keep your existing ignore rules
                    .ignoringRequestMatchers("/api/employees/session");
            })

            .cors(Customizer.withDefaults())

            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

            .authorizeHttpRequests(auth -> auth
                // Session bootstrap: any authenticated employee can call it
                .requestMatchers("/api/employees/session").hasAnyRole("ADMIN", "EMPLOYEE")

                // Admin-only endpoints
                .requestMatchers("/api/employees/admin/**").hasRole("ADMIN")

                // Everything else under /api/employees requires employee auth
                .anyRequest().hasAnyRole("ADMIN", "EMPLOYEE")
            )

            // Basic auth for employees
            .httpBasic(Customizer.withDefaults())

            // Prevent browser Basic Auth popup:
            // return a plain 401 JSON response instead of WWW-Authenticate challenge
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized\"}");
                })
            )

            // Writes XSRF-TOKEN cookie so frontend can send X-XSRF-TOKEN
            .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class);

        return http.build();
    }
}
