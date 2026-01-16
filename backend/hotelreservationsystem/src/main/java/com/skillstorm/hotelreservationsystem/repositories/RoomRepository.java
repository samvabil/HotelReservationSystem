package com.skillstorm.hotelreservationsystem.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.skillstorm.hotelreservationsystem.models.Room;

/**
 * Repository interface for Room entities.
 * <p>
 * Provides basic CRUD operations and custom query methods for accessing
 * room data in MongoDB. Includes specialized queries for availability checking,
 * filtering by attributes, and occupancy tracking.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Repository
public interface RoomRepository extends MongoRepository<Room, String> {

    /**
     * Finds all rooms available for a given date range.
     * <p>
     * A room is considered available if it does NOT have any unavailable date ranges
     * that overlap with the requested check-in and check-out dates.
     * Overlap logic: (BookedStart &lt; ReqEnd) AND (BookedEnd &gt; ReqStart)
     * </p>
     *
     * @param checkIn The requested check-in date.
     * @param checkOut The requested check-out date.
     * @return A list of available rooms.
     */
    @Query("{ 'unavailableDates': { $not: { $elemMatch: { 'start': { $lt: ?1 }, 'end': { $gt: ?0 } } } } }")
    List<Room> findAvailableRooms(LocalDate checkIn, LocalDate checkOut);

    /**
     * Finds all rooms with a specific accessibility status.
     *
     * @param accessible True to find accessible rooms; false otherwise.
     * @return A list of rooms matching the accessibility status.
     */
    List<Room> findByAccessible(boolean accessible);

    /**
     * Checks if a room with the specified room number exists.
     *
     * @param roomNumber The room number to check.
     * @return True if a room with this number exists; false otherwise.
     */
    boolean existsByRoomNumber(String roomNumber);
    
    /**
     * Counts the number of rooms of a specific room type.
     *
     * @param roomTypeId The unique identifier of the room type.
     * @return The count of rooms with the specified room type.
     */
    long countByRoomTypeId(String roomTypeId);

    /**
     * Finds all rooms of a specific room type.
     *
     * @param roomTypeId The unique identifier of the room type.
     * @return A list of rooms with the specified room type.
     */
    List<Room> findByRoomTypeId(String roomTypeId);

    /**
     * Finds all rooms that are currently occupied.
     *
     * @return A list of occupied rooms.
     */
    List<Room> findByOccupiedTrue();

    /**
     * Finds all occupied rooms except those with IDs in the provided list.
     * Useful for reconciliation tasks where certain rooms should be excluded.
     *
     * @param ids The list of room IDs to exclude from the results.
     * @return A list of occupied rooms not in the exclusion list.
     */
    List<Room> findByOccupiedTrueAndIdNotIn(List<String> ids);

}