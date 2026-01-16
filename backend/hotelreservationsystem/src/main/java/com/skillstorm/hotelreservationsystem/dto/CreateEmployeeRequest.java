package com.skillstorm.hotelreservationsystem.dto;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

/**
 * Data Transfer Object for creating new employee accounts.
 * <p>
 * This is a record class that encapsulates all the information needed to create
 * a new employee account, including validation constraints to ensure data integrity.
 * </p>
 *
 * @param employeeId The unique employee ID assigned by the organization.
 * @param email The employee's email address (must be a valid email format).
 * @param password The plain text password (will be hashed before storage).
 * @param roles The list of roles assigned to the employee (must not be empty).
 * @param isActive Whether the employee account should be active (optional, defaults to true if null).
 *
 * @author SkillStorm
 * @version 1.0
 */
public record CreateEmployeeRequest(
        @NotBlank String employeeId,
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotEmpty List<String> roles,
        Boolean isActive
) {}
