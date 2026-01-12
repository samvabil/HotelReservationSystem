package com.skillstorm.hotelreservationsystem.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.hotelreservationsystem.models.Reservation;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String>  {
    List<Reservation> findByUserId(String userId);
}
