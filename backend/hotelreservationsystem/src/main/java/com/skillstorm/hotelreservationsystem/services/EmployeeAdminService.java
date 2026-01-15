package com.skillstorm.hotelreservationsystem.services;

import java.time.Instant;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.skillstorm.hotelreservationsystem.dto.CreateEmployeeRequest;
import com.skillstorm.hotelreservationsystem.dto.EmployeeResponse;
import com.skillstorm.hotelreservationsystem.models.Employee;
import com.skillstorm.hotelreservationsystem.repositories.EmployeeRepository;

@Service
public class EmployeeAdminService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeAdminService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

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
