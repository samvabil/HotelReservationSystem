package com.skillstorm.hotelreservationsystem.controllers;

import com.skillstorm.hotelreservationsystem.dto.ReservationRequest;
import com.skillstorm.hotelreservationsystem.models.Reservation;
import com.skillstorm.hotelreservationsystem.services.ReservationService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing reservations.
 * <p>
 * This controller handles HTTP requests related to reservation operations such as
 * creating, retrieving, updating, and canceling reservations. All endpoints require
 * authentication via OAuth2 (Google login).
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * Constructs a new ReservationController with the specified service.
     *
     * @param reservationService The service for reservation operations.
     */
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /**
     * Creates a new reservation for the authenticated user.
     *
     * @param request The reservation request containing room, dates, and payment details.
     * @param principal The authenticated OAuth2 user (Google login).
     * @return A ResponseEntity containing the created reservation with HTTP 201 status.
     */
    @PostMapping
    public ResponseEntity<Reservation> createReservation(@RequestBody ReservationRequest request, @AuthenticationPrincipal OAuth2User principal) {
        // Get the email from the logged-in Google user
        String email = principal.getAttribute("email");
        
        Reservation reservation = reservationService.createReservation(request, email);
        return new ResponseEntity<>(reservation, HttpStatus.CREATED);
    }

    /**
     * Retrieves all reservations for the authenticated user.
     *
     * @param principal The authenticated OAuth2 user (Google login).
     * @return A list of reservations belonging to the authenticated user.
     */
    @GetMapping("/my-reservations")
    public List<Reservation> getMyReservations(@AuthenticationPrincipal OAuth2User principal) {
        return reservationService.getReservationsByUser(principal.getAttribute("email"));
    }

    /**
     * Updates an existing reservation.
     *
     * @param id The unique identifier of the reservation to update.
     * @param request The updated reservation details.
     * @return The updated reservation object.
     */
    @PutMapping("/{id}")
    public Reservation updateReservation(@PathVariable String id, @RequestBody ReservationRequest request) {
        return reservationService.updateReservation(id, request, false);
    }

    /**
     * Cancels a reservation by its ID.
     *
     * @param id The unique identifier of the reservation to cancel.
     * @return A ResponseEntity with no content and HTTP 204 status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable String id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.noContent().build();
    }
}