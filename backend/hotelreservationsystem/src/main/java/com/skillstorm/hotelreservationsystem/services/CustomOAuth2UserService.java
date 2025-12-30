package com.skillstorm.hotelreservationsystem.services;

import com.skillstorm.hotelreservationsystem.models.User;
import com.skillstorm.hotelreservationsystem.repositories.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

/**
 * Custom service for managing OAuth2 user authentication and data synchronization.
 * <p>
 * This class extends the default Spring Security {@link DefaultOAuth2UserService} to intercept
 * the login process. When a user successfully authenticates with an OAuth2 provider (e.g., Google),
 * this service checks if the user exists in the local MongoDB {@code users} collection.
 * </p>
 * <p>
 * If the user exists, their details (name, avatar) are updated to match the provider.
 * If the user does not exist, a new {@link User} entity is created and saved.
 * </p>
 * * @author SkillStorm
 * @version 1.0
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    /**
     * Constructs the CustomOAuth2UserService with the necessary repository.
     *
     * @param userRepository The repository used to CRUD user data in MongoDB.
     */
    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Loads the user from the OAuth2 provider and synchronizes their data with the local database.
     * <p>
     * This method delegates the actual loading of the user to the superclass (Spring Security).
     * Once the user is loaded, it extracts the attributes (email, name, picture) and performs
     * an "upsert" (update if exists, insert if new) operation on the local database.
     * </p>
     *
     * @param userRequest The request containing the client registration and access token.
     * @return The {@link OAuth2User} containing the attributes from the provider.
     * @throws OAuth2AuthenticationException If an error occurs while loading the user from the provider.
     */
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. Let the default service load the user from Google first
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 2. Extract the attributes (Google sends these)
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String firstName = (String) attributes.get("given_name");
        String lastName = (String) attributes.get("family_name");
        String picture = (String) attributes.get("picture");
        String providerId = oAuth2User.getName(); // This is the Google "sub" ID

        // 3. check if user exists in our DB
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            // Update existing user (sync details)
            User user = existingUser.get();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            // Ensure the AuthProvider object exists before setting the avatar
            if (user.getAuth() != null) {
                user.getAuth().setAvatarUrl(picture);
            } else {
                 user.setAuth(new User.AuthProvider("google", providerId, picture));
            }
            userRepository.save(user);
        } else {
            // Create new user
            User.AuthProvider auth = new User.AuthProvider("google", providerId, picture);
            User newUser = new User(email, firstName, lastName, auth, "ROLE_USER");
            userRepository.save(newUser);
        }

        // 4. Return the user so Spring can complete the login session
        return oAuth2User;
    }
}