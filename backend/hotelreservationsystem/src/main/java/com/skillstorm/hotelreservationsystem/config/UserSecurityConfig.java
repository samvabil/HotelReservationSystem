package com.skillstorm.hotelreservationsystem.config;

import com.skillstorm.hotelreservationsystem.services.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Security configuration for the Hotel Reservation System.
 * <p>
 * This configuration implements a "Hybrid" security model:
 * <ul>
 * <li><b>Authentication:</b> Supports both OAuth2 (Google) for guests and Form Login for employees.</li>
 * <li><b>Authorization:</b> Uses an "Open by Default" strategy. All endpoints are public unless explicitly secured.</li>
 * <li><b>CSRF:</b> Enabled using Cookie-based tokens for frontend integration.</li>
 * </ul>
 * </p>
 * * @author SkillStorm
 * @version 1.0
 */
@Configuration
@EnableWebSecurity
public class UserSecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final UserFrontendRedirectSuccessHandler successHandler;

    public UserSecurityConfig(CustomOAuth2UserService customOAuth2UserService, UserFrontendRedirectSuccessHandler successHandler) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.successHandler = successHandler;
    }

    /**
     * Defines the security filter chain.
     *
     * @param http The HttpSecurity builder.
     * @return The built SecurityFilterChain.
     * @throws Exception If an error occurs during configuration.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        
        // 1. Create a Handler that supports RAW tokens
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        // This is the specific line that fixes the 403 for React:
        requestHandler.setCsrfRequestAttributeName(null);
        
        http
            // 1. ENABLE CSRF (The secure way)
            // Uses CookieCsrfTokenRepository so frontends can read the XSRF-TOKEN cookie
            // and return it in the X-XSRF-TOKEN header.
            //.csrf(csrf -> csrf.disable())
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                // 2. PLUG IN THE HANDLER HERE
                .csrfTokenRequestHandler(requestHandler)
            )

            .cors(Customizer.withDefaults())

            // 2. Define URL Access Rules (OPEN BY DEFAULT)
            .authorizeHttpRequests(auth -> auth
                // --- PROTECTED ENDPOINTS (Blacklist) ---
                // Only these specific paths require login.
                .requestMatchers("/reservations/**", "/user/**").authenticated()

                // --- PUBLIC ENDPOINTS (Catch-All) ---
                // Everything else is allowed without login.
                .anyRequest().permitAll()
            )

            // 3. OAUTH2 (GUESTS)
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .oidcUserService(customOAuth2UserService)
                )
                // Forces unauthenticated users directly to Google, skipping the selection page.
                .loginPage("/oauth2/authorization/google") 
                .successHandler(successHandler)
            )

            .logout(logout -> logout
                .logoutUrl("/logout") // The URL we call from React
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK); // Return 200 instead of redirect
                })
                .invalidateHttpSession(true) // Kill the server session
                .deleteCookies("JSESSIONID", "XSRF-TOKEN") // Kill the browser cookie
            )

            // 4. FORM LOGIN (EMPLOYEES)
            // Keeps the standard login active for employees who are already authenticated
            // via a separate admin flow.
            .formLogin(Customizer.withDefaults())
            .httpBasic(Customizer.withDefaults())
            .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class);

        return http.build();
    }
}