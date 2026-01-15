package com.skillstorm.hotelreservationsystem.controllers;

import com.skillstorm.hotelreservationsystem.models.User;
import com.skillstorm.hotelreservationsystem.repositories.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * A test endpoint to see WHO is logged in.
     * Accessible at: http://localhost:8080/user
     */
    @GetMapping
    public User getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        // 1. Get the email from the Google Login data
        String email = principal.getAttribute("email");

        // 2. Fetch the full User object from OUR MongoDB
        // This proves the "CustomOAuth2UserService" worked and saved them to the DB.
        Optional<User> user = userRepository.findByEmail(email);
        
        return user.orElse(null); // Should never be null if your Service works!
    }
}