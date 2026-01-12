package com.skillstorm.hotelreservationsystem.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.skillstorm.hotelreservationsystem.models.Room;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {

    // 1. Basic Availability Check
    // "Find rooms where unavailableDates does NOT contain any entry that overlaps with [start, end]"
    // Overlap Logic: (BookedStart < ReqEnd) AND (BookedEnd > ReqStart)
    @Query("{ 'unavailableDates': { $not: { $elemMatch: { 'start': { $lt: ?1 }, 'end': { $gt: ?0 } } } } }")
    List<Room> findAvailableRooms(LocalDate checkIn, LocalDate checkOut);

    // 2. You can also add basic attribute filtering here if you want to optimize
    List<Room> findByAccessible(boolean accessible);

    boolean existsByRoomNumber(String roomNumber);
    
    long countByRoomTypeId(String roomTypeId);

}