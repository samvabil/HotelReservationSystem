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

@Configuration
@Order(1)
public class EmployeeSecurityConfig {

    @Bean
    public SecurityFilterChain employeeFilterChain(HttpSecurity http) throws Exception {

        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        http
            // Only applies to employee API paths
            .securityMatcher("/api/employees/**")

            // CSRF enabled, but ignore the bootstrap session endpoint
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(requestHandler)
                .ignoringRequestMatchers("/api/employees/session")
            )

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
