package com.skillstorm.hotelreservationsystem.controllers;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.hotelreservationsystem.dto.ReservationAdminSearchResponse;
import com.skillstorm.hotelreservationsystem.dto.ReservationRequest;
import com.skillstorm.hotelreservationsystem.dto.RevenueReportResponse;
import com.skillstorm.hotelreservationsystem.models.Reservation;
import com.skillstorm.hotelreservationsystem.services.EmployeeReservationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/employees/reservations")
public class EmployeeReservationController {

    private final EmployeeReservationService employeeReservationService;

    public EmployeeReservationController(EmployeeReservationService employeeReservationService) {
        this.employeeReservationService = employeeReservationService;
    }

    @GetMapping
    public ReservationAdminSearchResponse<Reservation> search(
            @RequestParam(required = false) String reservationId,
            @RequestParam(required = false) String guestEmail,
            @RequestParam(required = false) String roomTypeId,
            @RequestParam(required = false) Reservation.ReservationStatus status,
            @RequestParam(required = false) Boolean currentlyCheckedIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "checkIn") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction sortDir
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        Page<Reservation> result = employeeReservationService.search(
                reservationId,
                guestEmail,
                roomTypeId,
                status,
                currentlyCheckedIn,
                from,
                to,
                pageable
        );

        return new ReservationAdminSearchResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @PutMapping("/{id}")
    public Reservation update(@PathVariable String id, @Valid @RequestBody ReservationRequest req) {
        return employeeReservationService.employeeUpdateReservation(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable String id) {
        employeeReservationService.employeeCancelReservation(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/check-in")
    public Reservation checkIn(@PathVariable String id) {
        return employeeReservationService.checkIn(id);
    }

    @PostMapping("/{id}/check-out")
    public Reservation checkOut(@PathVariable String id) {
        return employeeReservationService.checkOut(id);
    }

    @GetMapping("/reports/revenue")
    public RevenueReportResponse revenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return employeeReservationService.revenue(from, to);
    }
}
