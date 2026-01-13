package com.skillstorm.hotelreservationsystem.repositories;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import com.skillstorm.hotelreservationsystem.models.Reservation;

@Repository
public class ReservationRepositoryImpl implements ReservationRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public ReservationRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Page<Reservation> adminSearch(
            String reservationId,
            String userId,
            List<String> roomIds,
            Reservation.ReservationStatus status,
            Boolean currentlyCheckedIn,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    ) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (reservationId != null && !reservationId.isBlank()) {
            criteriaList.add(Criteria.where("_id").is(reservationId));
        }
        if (userId != null && !userId.isBlank()) {
            criteriaList.add(Criteria.where("userId").is(userId));
        }
        if (roomIds != null) {
            if (roomIds.isEmpty()) {
                // If roomType filter produced no rooms, return empty quickly
                return Page.empty(pageable);
            }
            criteriaList.add(Criteria.where("roomId").in(roomIds));
        }
        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status));
        }
        if (currentlyCheckedIn != null) {
            if (currentlyCheckedIn) {
                criteriaList.add(Criteria.where("status").is(Reservation.ReservationStatus.CHECKED_IN));
            } else {
                criteriaList.add(Criteria.where("status").ne(Reservation.ReservationStatus.CHECKED_IN));
            }
        }

        // Date overlap filter: (checkIn < to) AND (checkOut > from)
        if (from != null && to != null) {
            criteriaList.add(new Criteria().andOperator(
                    Criteria.where("checkIn").lt(to),
                    Criteria.where("checkOut").gt(from)
            ));
        } else if (from != null) {
            criteriaList.add(Criteria.where("checkOut").gt(from));
        } else if (to != null) {
            criteriaList.add(Criteria.where("checkIn").lt(to));
        }

        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList));
        }

        long total = mongoTemplate.count(query, Reservation.class);

        Query paged = query.with(pageable);
        List<Reservation> items = mongoTemplate.find(paged, Reservation.class);

        return new PageImpl<>(items, pageable, total);
    }
}
