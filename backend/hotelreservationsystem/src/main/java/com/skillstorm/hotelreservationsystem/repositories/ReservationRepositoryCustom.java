package com.skillstorm.hotelreservationsystem.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.skillstorm.hotelreservationsystem.models.Reservation;

/**
 * Custom repository interface for advanced reservation search operations.
 * <p>
 * This interface defines custom query methods that require complex MongoDB queries
 * beyond the capabilities of Spring Data's method name-based query generation.
 * The implementation is provided by {@code ReservationRepositoryImpl}.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
public interface ReservationRepositoryCustom {
    /**
     * Performs an advanced search for reservations with multiple filter criteria.
     * <p>
     * This method supports pagination and allows filtering by reservation ID, user ID,
     * room IDs, status, check-in state, and date ranges. All parameters are optional
     * to allow flexible searching.
     * </p>
     *
     * @param reservationId The unique identifier of the reservation to search for.
     * @param userId The unique identifier of the user to filter by.
     * @param roomIds A list of room IDs to filter by (any room in the list).
     * @param status The reservation status to filter by.
     * @param currentlyCheckedIn Whether to filter by check-in status.
     * @param from The start date for date range filtering.
     * @param to The end date for date range filtering.
     * @param pageable Pagination information (page number, size, sorting).
     * @return A page of reservations matching the search criteria.
     */
    Page<Reservation> adminSearch(
            String reservationId,
            String userId,
            List<String> roomIds,
            Reservation.ReservationStatus status,
            Boolean currentlyCheckedIn,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    );
}
