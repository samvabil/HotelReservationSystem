package com.skillstorm.hotelreservationsystem.controllers;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @GetMapping("/me")
    public Authentication me(Authentication auth) {
        return auth;
    }

    @GetMapping("/admin/health")
    public String adminOnly() {
        return "Admin OK";
    }
}
