package com.skillstorm.hotelreservationsystem.repositories;

import com.skillstorm.hotelreservationsystem.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entities.
 * <p>
 * Provides basic CRUD operations and custom query methods for accessing
 * user data in MongoDB.
 * </p>
 * * @author SkillStorm
 * @version 1.0
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Finds a user by their email address.
     * <p>
     * This is a "Query Method" - Spring Data automatically generates the query implementation
     * based on the method name. It matches the "email" field in the User class.
     * </p>
     *
     * @param email The email address to search for.
     * @return An Optional containing the User if found, or empty if not.
     */
    Optional<User> findByEmail(String email);
}