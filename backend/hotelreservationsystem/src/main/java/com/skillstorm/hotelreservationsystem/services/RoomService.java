package com.skillstorm.hotelreservationsystem.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.skillstorm.hotelreservationsystem.dto.BookingSearchRequest;
import com.skillstorm.hotelreservationsystem.dto.BookingSearchResult;
import com.skillstorm.hotelreservationsystem.models.Room;
import com.skillstorm.hotelreservationsystem.models.RoomType;
import com.skillstorm.hotelreservationsystem.repositories.RoomRepository;
import com.skillstorm.hotelreservationsystem.repositories.RoomTypeRepository;

/**
 * Service class for managing room operations and searches.
 * <p>
 * This service handles business logic for retrieving rooms, searching for available rooms
 * based on various criteria, and filtering results by amenities and gaming equipment.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    /**
     * Constructs a new RoomService with the required repositories.
     *
     * @param roomRepository The repository for room data access.
     * @param roomTypeRepository The repository for room type data access.
     */
    public RoomService(RoomRepository roomRepository, RoomTypeRepository roomTypeRepository) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    /**
     * Retrieves a room by its unique identifier and populates the room type information.
     *
     * @param id The unique identifier of the room.
     * @return The room with populated room type data.
     * @throws RuntimeException if the room is not found.
     */
    public Room getRoomById(String id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Room not found with ID: " + id));

        if (room.getRoomTypeId() != null) {
            RoomType type = roomTypeRepository.findById(room.getRoomTypeId()).orElse(null);
            room.setRoomType(type); // This fills the @Transient field
        }

        return room;
    }

    /**
     * Searches for available rooms matching the specified criteria.
     * <p>
     * This method performs a comprehensive search by:
     * 1. Finding rooms available for the requested date range
     * 2. Filtering by room attributes (accessible, pet-friendly, non-smoking)
     * 3. Grouping rooms by room type
     * 4. Filtering room types by specifications, amenities, and gaming equipment
     * 5. Returning results grouped by room type with available room instances
     * </p>
     *
     * @param request The search request containing all filter criteria.
     * @return A list of search results, each containing a room type and its available rooms.
     */
    public List<BookingSearchResult> searchRoomTypes(BookingSearchRequest request) {
        
        // 1. Find physical rooms available for dates
        List<Room> availableRooms;
        if (request.getCheckInDate() != null && request.getCheckOutDate() != null) {
            availableRooms = roomRepository.findAvailableRooms(request.getCheckInDate(), request.getCheckOutDate());
        } else {
            availableRooms = roomRepository.findAll();
        }

        // 2. Filter physical rooms by "Hard" attributes (Pet Friendly, etc.)
        availableRooms = availableRooms.stream()
            .filter(room -> request.getAccessible() == null || room.isAccessible() == request.getAccessible())
            .filter(room -> request.getPetFriendly() == null || room.isPetFriendly() == request.getPetFriendly())
            .filter(room -> request.getNonSmoking() == null || room.isNonSmoking() == request.getNonSmoking())
            .collect(Collectors.toList());

        // 3. GROUP rooms by their RoomType ID
        // Map<String, List<Room>> -> "type-123" : [Room 101, Room 102]
        Map<String, List<Room>> roomsByType = availableRooms.stream()
            .collect(Collectors.groupingBy(room -> room.getRoomTypeId()));

        // 4. Fetch the Definitions for these types
        List<RoomType> matchingTypes = roomTypeRepository.findAllById(roomsByType.keySet());

        // 5. Filter the Types by "Soft" attributes (Price, PC Specs)
        matchingTypes = matchingTypes.stream()
            .filter(type -> request.getMinPrice() == null || type.getPricePerNight() >= request.getMinPrice())
            .filter(type -> request.getMaxPrice() == null || type.getPricePerNight() <= request.getMaxPrice())
            .filter(type -> request.getGuestCount() == null || type.getCapacity() >= request.getGuestCount())
            .filter(type -> request.getMinBeds() == null || type.getNumBeds() >= request.getMinBeds())
            .filter(type -> request.getMinBedrooms() == null || type.getNumBedroom() >= request.getMinBedrooms())
            .filter(type -> request.getHasJacuzzi() == null || type.isHasJacuzzi() == request.getHasJacuzzi())
            .filter(type -> request.getPcCount() == null || type.getNumPcs() >= request.getPcCount())
            .filter(type -> request.getPcTier() == null || isTierCompatible(type.getLevelOfPc(), request.getPcTier()))
            .filter(type -> request.getConsoles() == null || type.getConsoles().containsAll(request.getConsoles()))
            .collect(Collectors.toList());

        // 6. BUILD THE DTOs
        // Combine the filtered Type with the specific list of Rooms we found in Step 3
        List<BookingSearchResult> results = new ArrayList<>();
        
        for (RoomType type : matchingTypes) {
            List<Room> specificRooms = roomsByType.get(type.getId());
            
            if (specificRooms != null) {
                for (Room r : specificRooms) {
                    r.setRoomType(type); 
                }
                results.add(new BookingSearchResult(type, specificRooms));
            }
        }

        return results;
    }

    /**
     * Checks if a room's PC tier meets or exceeds the requested tier level.
     *
     * @param roomTier The PC tier level of the room (1, 2, or 3).
     * @param reqTier The requested tier level string ("Standard", "High-End", or "God-Tier").
     * @return True if the room tier is compatible with or exceeds the requested tier.
     */
    private boolean isTierCompatible(int roomTier, String reqTier) {
        int reqTierLevel = switch (reqTier) {
            case "Standard" -> 1;
            case "High-End" -> 2;
            case "God-Tier" -> 3;
            default -> 0;
        };
        return roomTier >= reqTierLevel;
    }
}