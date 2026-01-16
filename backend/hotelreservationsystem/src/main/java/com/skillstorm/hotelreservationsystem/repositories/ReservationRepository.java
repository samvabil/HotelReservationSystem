package com.skillstorm.hotelreservationsystem.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.hotelreservationsystem.models.Reservation;
import com.skillstorm.hotelreservationsystem.models.Reservation.ReservationStatus;

/**
 * Repository interface for Reservation entities.
 * <p>
 * Provides basic CRUD operations and custom query methods for accessing
 * reservation data in MongoDB. Extends custom repository interface for
 * advanced search functionality.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String>, ReservationRepositoryCustom  {
    /**
     * Finds all reservations for a specific user.
     *
     * @param userId The unique identifier of the user.
     * @return A list of reservations belonging to the specified user.
     */
    List<Reservation> findByUserId(String userId);
    
    /**
     * Finds all reservations with check-out dates before the specified date
     * and matching the given status.
     *
     * @param date The date to compare check-out dates against.
     * @param status The reservation status to filter by.
     * @return A list of reservations matching the criteria.
     */
    List<Reservation> findByCheckOutBeforeAndStatus(LocalDate date, ReservationStatus status);
}
