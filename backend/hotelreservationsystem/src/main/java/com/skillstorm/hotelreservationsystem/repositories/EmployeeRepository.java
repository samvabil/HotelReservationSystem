package com.skillstorm.hotelreservationsystem.repositories;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.hotelreservationsystem.models.Employee;

/**
 * Repository interface for Employee entities.
 * <p>
 * Provides basic CRUD operations and custom query methods for accessing
 * employee data in MongoDB. Includes methods for finding employees by email
 * and checking existence of employee identifiers.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    /**
     * Finds an employee by their email address.
     *
     * @param email The email address to search for.
     * @return An Optional containing the Employee if found, or empty if not.
     */
    Optional<Employee> findByEmail(String email);
    
    /**
     * Checks if an employee with the specified email exists.
     *
     * @param email The email address to check.
     * @return True if an employee with this email exists; false otherwise.
     */
    boolean existsByEmail(String email);
    
    /**
     * Checks if an employee with the specified employee ID exists.
     *
     * @param employeeId The employee ID to check.
     * @return True if an employee with this ID exists; false otherwise.
     */
    boolean existsByEmployeeId(String employeeId);
}
