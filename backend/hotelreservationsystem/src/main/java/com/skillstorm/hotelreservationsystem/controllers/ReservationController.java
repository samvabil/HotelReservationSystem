package com.skillstorm.hotelreservationsystem.controllers;

import com.skillstorm.hotelreservationsystem.dto.ReservationRequest;
import com.skillstorm.hotelreservationsystem.models.Reservation;
import com.skillstorm.hotelreservationsystem.services.ReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<Reservation> createReservation(@RequestBody ReservationRequest request, @AuthenticationPrincipal OAuth2User principal) {
        // Get the email from the logged-in Google user
        String email = principal.getAttribute("email");
        
        Reservation reservation = reservationService.createReservation(request, email);
        return new ResponseEntity<>(reservation, HttpStatus.CREATED);
    }
}