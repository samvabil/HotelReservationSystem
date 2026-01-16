package com.skillstorm.hotelreservationsystem.controllers;

import com.skillstorm.hotelreservationsystem.models.User;
import com.skillstorm.hotelreservationsystem.repositories.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

/**
 * REST controller for user-related operations.
 * <p>
 * This controller handles HTTP requests related to authenticated user information.
 * All endpoints require OAuth2 authentication via Google login.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@RestController
@RequestMapping("/user")
public class UserController {

    private final UserRepository userRepository;

    /**
     * Constructs a new UserController with the specified repository.
     *
     * @param userRepository The repository for user data access.
     */
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Retrieves the currently authenticated user's information.
     * <p>
     * This endpoint uses OAuth2 principal to identify the logged-in user and
     * fetches their complete user profile from the database.
     * </p>
     *
     * @param principal The authenticated OAuth2 user (Google login).
     * @return The User object for the authenticated user, or null if not found.
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