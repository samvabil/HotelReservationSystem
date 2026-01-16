package com.skillstorm.hotelreservationsystem.dto;

import java.time.Instant;
import java.util.List;

/**
 * Data Transfer Object for employee response data.
 * <p>
 * This is a record class that represents employee information returned to clients.
 * It excludes sensitive data like passwords.
 * </p>
 *
 * @param id The unique MongoDB identifier of the employee.
 * @param employeeId The business employee ID assigned by the organization.
 * @param email The employee's email address.
 * @param roles The list of roles assigned to the employee.
 * @param isActive Whether the employee account is currently active.
 * @param createdAt The timestamp when the account was created.
 * @param lastLogin The timestamp of the employee's last login, or null if never logged in.
 *
 * @author SkillStorm
 * @version 1.0
 */
public record EmployeeResponse(
        String id,
        String employeeId,
        String email,
        List<String> roles,
        boolean isActive,
        Instant createdAt,
        Instant lastLogin
) {}
