package com.skillstorm.hotelreservationsystem.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.skillstorm.hotelreservationsystem.models.Reservation;

public interface ReservationRepositoryCustom {
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
