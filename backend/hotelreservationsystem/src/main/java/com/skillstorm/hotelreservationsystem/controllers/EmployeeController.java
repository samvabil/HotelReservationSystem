package com.skillstorm.hotelreservationsystem.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.hotelreservationsystem.dto.CreateEmployeeRequest;
import com.skillstorm.hotelreservationsystem.dto.EmployeeResponse;
import com.skillstorm.hotelreservationsystem.models.Employee;
import com.skillstorm.hotelreservationsystem.services.EmployeeAdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeAdminService employeeAdminService;

    public EmployeeController(EmployeeAdminService employeeAdminService) {
        this.employeeAdminService = employeeAdminService;
    }

    @PostMapping("/admin")
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createEmployee(@Valid @RequestBody CreateEmployeeRequest req) {
        return employeeAdminService.createEmployee(req);
    }

    @GetMapping("/me")
    public EmployeeResponse me(@AuthenticationPrincipal Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeId(),
                employee.getEmail(),
                employee.getRoles(),
                employee.isActive(),
                employee.getCreatedAt(),
                employee.getLastLogin()
        );
    }

    /**
     * If this endpoint is reached, Basic Auth succeeded. Spring will create a session and store SecurityContext automatically.
     */
    @PostMapping("/session")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void startSession() {
    }

}
