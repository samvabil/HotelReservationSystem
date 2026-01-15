package com.skillstorm.hotelreservationsystem.dto;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record CreateEmployeeRequest(
        @NotBlank String employeeId,
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotEmpty List<String> roles,
        Boolean isActive
) {}
