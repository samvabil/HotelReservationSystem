package com.skillstorm.hotelreservationsystem.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Application is Running!");
    }

    // AWS sometimes checks this path too
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck2() {
        return ResponseEntity.ok("Healthy");
    }
}