package com.skillstorm.hotelreservationsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@Order(1) 
public class EmployeeSecurityConfig {

    @Bean
    public SecurityFilterChain employeeSecurityFilterChain(HttpSecurity http) throws Exception {

        http
            .securityMatcher("/api/employees/**")
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/employees/login").authenticated()
                .requestMatchers("/api/employees/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/employees/**").authenticated()
            )
            .httpBasic();

        return http.build();
    }
}
