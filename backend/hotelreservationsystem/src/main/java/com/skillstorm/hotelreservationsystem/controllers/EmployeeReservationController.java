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

/**
 * REST controller for employee reservation management operations.
 * <p>
 * This controller handles HTTP requests for employees to manage reservations,
 * including searching, updating, cancelling, checking in/out guests, and viewing revenue reports.
 * All endpoints require employee authentication.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@RestController
@RequestMapping("employees/reservations")
public class EmployeeReservationController {

    private final EmployeeReservationService employeeReservationService;

    /**
     * Constructs a new EmployeeReservationController with the specified service.
     *
     * @param employeeReservationService The service for employee reservation operations.
     */
    public EmployeeReservationController(EmployeeReservationService employeeReservationService) {
        this.employeeReservationService = employeeReservationService;
    }

    /**
     * Searches for reservations with multiple filter criteria and pagination.
     *
     * @param reservationId Filter by reservation ID (optional).
     * @param guestEmail Filter by guest email address (optional).
     * @param roomTypeId Filter by room type ID (optional).
     * @param status Filter by reservation status (optional).
     * @param currentlyCheckedIn Filter by check-in status (optional).
     * @param from Start date for date range filtering (optional).
     * @param to End date for date range filtering (optional).
     * @param page Page number for pagination (default: 0).
     * @param size Number of items per page (default: 20).
     * @param sortBy Field name to sort by (default: "checkIn").
     * @param sortDir Sort direction (default: DESC).
     * @return A paginated response containing matching reservations.
     */
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

    /**
     * Updates a reservation with employee override privileges.
     *
     * @param id The unique identifier of the reservation to update.
     * @param req The updated reservation details.
     * @return The updated reservation.
     */
    @PutMapping("/{id}")
    public Reservation update(@PathVariable String id, @Valid @RequestBody ReservationRequest req) {
        return employeeReservationService.employeeUpdateReservation(id, req);
    }

    /**
     * Cancels a reservation with employee override privileges.
     *
     * @param id The unique identifier of the reservation to cancel.
     * @return A ResponseEntity with no content and HTTP 204 status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable String id) {
        employeeReservationService.employeeCancelReservation(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Checks in a guest for a reservation.
     *
     * @param id The unique identifier of the reservation.
     * @return The updated reservation with CHECKED_IN status.
     */
    @PostMapping("/{id}/check-in")
    public Reservation checkIn(@PathVariable String id) {
        return employeeReservationService.checkIn(id);
    }

    /**
     * Checks out a guest from a reservation.
     *
     * @param id The unique identifier of the reservation.
     * @return The updated reservation with COMPLETED status.
     */
    @PostMapping("/{id}/check-out")
    public Reservation checkOut(@PathVariable String id) {
        return employeeReservationService.checkOut(id);
    }

    /**
     * Retrieves a revenue report for the specified date range.
     *
     * @param from The start date for the report (optional).
     * @param to The end date for the report (optional).
     * @return A revenue report with total and monthly breakdowns.
     */
    @GetMapping("/reports/revenue")
    public RevenueReportResponse revenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return employeeReservationService.revenue(from, to);
    }
}
