package com.skillstorm.hotelreservationsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration class for password encoding.
 * <p>
 * This configuration provides a BCrypt password encoder bean for securely
 * hashing employee passwords before storage.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Configuration
public class PasswordConfig {

    /**
     * Creates a BCrypt password encoder bean.
     * <p>
     * BCrypt is a strong, adaptive hashing algorithm suitable for password storage.
     * </p>
     *
     * @return A BCryptPasswordEncoder instance.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
