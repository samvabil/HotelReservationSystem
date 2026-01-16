package com.skillstorm.hotelreservationsystem.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

/**
 * REST controller for employee-related operations.
 * <p>
 * This controller handles HTTP requests related to employee account management,
 * authentication sessions, and profile retrieval. Requires employee authentication.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeAdminService employeeAdminService;

    /**
     * Constructs a new EmployeeController with the specified service.
     *
     * @param employeeAdminService The service for employee administration operations.
     */
    public EmployeeController(EmployeeAdminService employeeAdminService) {
        this.employeeAdminService = employeeAdminService;
    }

    /**
     * Creates a new employee account.
     * <p>
     * This endpoint is restricted to admin users and creates a new employee
     * with the specified credentials and roles.
     * </p>
     *
     * @param req The employee creation request with validation constraints.
     * @return The created employee response with HTTP 201 status.
     */
    @PostMapping("/admin")
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createEmployee(@Valid @RequestBody CreateEmployeeRequest req) {
        return employeeAdminService.createEmployee(req);
    }

    /**
     * Retrieves the currently authenticated employee's profile information.
     *
     * @param employee The authenticated employee principal.
     * @return The employee's profile information.
     */
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
     * Starts a session for an authenticated employee.
     * <p>
     * If this endpoint is reached, Basic Auth succeeded. This method creates a session
     * and stores the SecurityContext for subsequent requests using cookie-based authentication.
     * </p>
     *
     * @param request The HTTP servlet request.
     * @param auth The authentication object from Basic Auth.
     * @return A ResponseEntity with no content and HTTP 204 status if successful, or HTTP 401 if not authenticated.
     */
    @PostMapping("/session")
    public ResponseEntity<Void> startSession(HttpServletRequest request, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        HttpSession session = request.getSession(true);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);

        session.setAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
            context
        );

        return ResponseEntity.noContent().build();
    }

    /**
     * Logs out the currently authenticated employee by invalidating the session.
     *
     * @param request The HTTP servlet request.
     * @param response The HTTP servlet response.
     * @return A ResponseEntity with no content and HTTP 204 status.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.noContent().build();
    }
}
