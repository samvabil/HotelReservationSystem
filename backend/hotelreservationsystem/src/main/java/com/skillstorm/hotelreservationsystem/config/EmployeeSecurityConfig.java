package com.skillstorm.hotelreservationsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import com.skillstorm.hotelreservationsystem.services.EmployeeUserDetailsService;

@Configuration
@Order(1)
public class EmployeeSecurityConfig {

    private final EmployeeUserDetailsService employeeUserDetailsService;
    private final PasswordEncoder passwordEncoder;

    public EmployeeSecurityConfig(
            EmployeeUserDetailsService employeeUserDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        this.employeeUserDetailsService = employeeUserDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public SecurityFilterChain employeeFilterChain(HttpSecurity http) throws Exception {

        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        http
            .securityMatcher("/api/employees/**")

            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(requestHandler)
            )

            .cors(Customizer.withDefaults())

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/employees/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/employees/session").hasAnyRole("ADMIN", "EMPLOYEE")
                .requestMatchers("/api/employees/**").hasAnyRole("ADMIN", "EMPLOYEE")
            )

            .httpBasic(Customizer.withDefaults())

            .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class);

        return http.build();
    }
}
