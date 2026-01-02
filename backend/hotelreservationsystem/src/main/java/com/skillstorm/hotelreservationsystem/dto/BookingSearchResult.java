package com.skillstorm.hotelreservationsystem.dto;

import com.skillstorm.hotelreservationsystem.models.Room;
import com.skillstorm.hotelreservationsystem.models.RoomType;
import java.util.List;

public class BookingSearchResult {
    
    private RoomType roomType;
    private List<Room> availableRooms;

    public BookingSearchResult(RoomType roomType, List<Room> availableRooms) {
        this.roomType = roomType;
        this.availableRooms = availableRooms;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public List<Room> getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(List<Room> availableRooms) {
        this.availableRooms = availableRooms;
    }
}