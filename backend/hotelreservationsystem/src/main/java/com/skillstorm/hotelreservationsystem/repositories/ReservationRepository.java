package com.skillstorm.hotelreservationsystem.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.hotelreservationsystem.models.Reservation;
import com.skillstorm.hotelreservationsystem.models.Reservation.ReservationStatus;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String>, ReservationRepositoryCustom  {
    List<Reservation> findByUserId(String userId);
    List<Reservation> findByCheckOutBeforeAndStatus(LocalDate date, ReservationStatus status);
}
