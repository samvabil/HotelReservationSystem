package com.skillstorm.hotelreservationsystem.controllers;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.hotelreservationsystem.models.Employee;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @GetMapping("/me")
    public EmployeeMeResponse me(@AuthenticationPrincipal Employee employee) {
        return new EmployeeMeResponse(
                employee.getEmployeeId(),
                employee.getEmail(),
                employee.getRoles(),
                employee.isActive()
        );
    }

    @GetMapping("/admin/health")
    public String adminOnly() {
        return "Admin OK";
    }

    public record EmployeeMeResponse(
            String employeeId,
            String email,
            List<String> roles,
            boolean isActive
    ) {}
}
