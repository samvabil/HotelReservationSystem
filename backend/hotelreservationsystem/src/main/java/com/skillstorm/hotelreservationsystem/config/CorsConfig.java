package com.skillstorm.hotelreservationsystem.config;

import org.springframework.beans.factory.annotation.Value; // Import this
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * Configuration class for Cross-Origin Resource Sharing (CORS).
 * <p>
 * This configuration allows the frontend application to make requests to the backend API
 * from a different origin. The allowed origins are configured via application properties.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Configuration
public class CorsConfig {

    /**
     * The allowed origins for CORS requests, injected from application.yml.
     */
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * Creates and configures a CORS filter bean.
     * <p>
     * This filter allows credentials (cookies), configures allowed origins dynamically
     * from application properties, and sets standard allowed headers and HTTP methods.
     * </p>
     *
     * @return A configured CorsFilter bean.
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // 1. Allow credentials (cookies)
        config.setAllowCredentials(true);
        
        // 2. Allow specific Frontend URL (Dynamic)
        config.setAllowedOrigins(List.of(allowedOrigins)); 
        
        // 3. Allow standard headers and methods
        config.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type", "X-XSRF-TOKEN"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}