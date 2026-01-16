package com.skillstorm.hotelreservationsystem.services;

import java.time.Instant;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.skillstorm.hotelreservationsystem.dto.CreateEmployeeRequest;
import com.skillstorm.hotelreservationsystem.dto.EmployeeResponse;
import com.skillstorm.hotelreservationsystem.models.Employee;
import com.skillstorm.hotelreservationsystem.repositories.EmployeeRepository;

/**
 * Service class for employee administration operations.
 * <p>
 * This service handles business logic for creating and managing employee accounts,
 * including password hashing and validation of unique identifiers.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Service
public class EmployeeAdminService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Constructs a new EmployeeAdminService with the required dependencies.
     *
     * @param employeeRepository The repository for employee data access.
     * @param passwordEncoder The password encoder for hashing passwords.
     */
    public EmployeeAdminService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Creates a new employee account.
     * <p>
     * Validates that the email and employee ID are unique, hashes the password,
     * normalizes role names (adding ROLE_ prefix if missing), and saves the employee.
     * </p>
     *
     * @param req The employee creation request.
     * @return The created employee response.
     * @throws IllegalArgumentException if the email or employee ID already exists.
     */
    public EmployeeResponse createEmployee(CreateEmployeeRequest req) {

        if (employeeRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already exists: " + req.email());
        }
        if (employeeRepository.existsByEmployeeId(req.employeeId())) {
            throw new IllegalArgumentException("EmployeeId already exists: " + req.employeeId());
        }

        Employee e = new Employee();
        e.setEmployeeId(req.employeeId());
        e.setEmail(req.email().toLowerCase());
        e.setPasswordHash(passwordEncoder.encode(req.password()));

        List<String> roles = req.roles().stream()
                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                .toList();
        e.setRoles(roles);

        if (req.isActive() != null) {
            e.setActive(req.isActive());
        }

        e.setCreatedAt(Instant.now());

        Employee saved = employeeRepository.save(e);
        return toResponse(saved);
    }

    /**
     * Converts an Employee entity to an EmployeeResponse DTO.
     *
     * @param e The Employee entity to convert.
     * @return The EmployeeResponse DTO.
     */
    private EmployeeResponse toResponse(Employee e) {
        return new EmployeeResponse(
                e.getId(),
                e.getEmployeeId(),
                e.getEmail(),
                e.getRoles(),
                e.isActive(),
                e.getCreatedAt(),
                e.getLastLogin()
        );
    }
}
