package com.skillstorm.hotelreservationsystem.dto;

import com.skillstorm.hotelreservationsystem.models.Room;
import com.skillstorm.hotelreservationsystem.models.RoomType;
import java.util.List;

/**
 * Data Transfer Object for room search results.
 * <p>
 * This DTO represents a room type along with all available rooms of that type
 * that match the search criteria. Used to group search results by room type
 * for display purposes.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
public class BookingSearchResult {
    
    /**
     * The room type information (specifications, amenities, pricing).
     */
    private RoomType roomType;
    
    /**
     * A list of available rooms of this type that match the search criteria.
     */
    private List<Room> availableRooms;

    /**
     * Constructs a new BookingSearchResult with the specified room type and available rooms.
     *
     * @param roomType The room type information.
     * @param availableRooms The list of available rooms of this type.
     */
    public BookingSearchResult(RoomType roomType, List<Room> availableRooms) {
        this.roomType = roomType;
        this.availableRooms = availableRooms;
    }

    /**
     * Gets the room type information.
     *
     * @return The RoomType object.
     */
    public RoomType getRoomType() {
        return roomType;
    }

    /**
     * Sets the room type information.
     *
     * @param roomType The RoomType object to set.
     */
    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    /**
     * Gets the list of available rooms.
     *
     * @return The list of available rooms.
     */
    public List<Room> getAvailableRooms() {
        return availableRooms;
    }

    /**
     * Sets the list of available rooms.
     *
     * @param availableRooms The list of available rooms to set.
     */
    public void setAvailableRooms(List<Room> availableRooms) {
        this.availableRooms = availableRooms;
    }
}