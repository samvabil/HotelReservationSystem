package com.skillstorm.hotelreservationsystem.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

/**
 * REST controller for health check endpoints.
 * <p>
 * This controller provides simple endpoints to verify that the application
 * is running and responding to requests. Used for monitoring and deployment health checks.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@RestController
public class HealthController {

    /**
     * Health check endpoint at the root path.
     * <p>
     * Returns a simple status message indicating the application is running.
     * </p>
     *
     * @return A ResponseEntity with HTTP 200 status and a success message.
     */
    @GetMapping("/")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Application is Running!");
    }

    /**
     * Health check endpoint at the /health path.
     * <p>
     * This is a common path used by monitoring systems and cloud platforms
     * (e.g., AWS Elastic Beanstalk, Kubernetes) to check application health.
     * </p>
     *
     * @return A ResponseEntity with HTTP 200 status and a "Healthy" message.
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck2() {
        return ResponseEntity.ok("Healthy");
    }
}