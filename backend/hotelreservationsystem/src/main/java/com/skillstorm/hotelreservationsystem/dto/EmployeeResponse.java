package com.skillstorm.hotelreservationsystem.dto;

import java.time.Instant;
import java.util.List;

public record EmployeeResponse(
        String id,
        String employeeId,
        String email,
        List<String> roles,
        boolean isActive,
        Instant createdAt,
        Instant lastLogin
) {}
