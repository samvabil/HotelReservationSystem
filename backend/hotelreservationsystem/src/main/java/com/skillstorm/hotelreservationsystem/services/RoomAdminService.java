package com.skillstorm.hotelreservationsystem.services;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.skillstorm.hotelreservationsystem.dto.RoomUpsertRequest;
import com.skillstorm.hotelreservationsystem.models.Room;
import com.skillstorm.hotelreservationsystem.models.RoomType;
import com.skillstorm.hotelreservationsystem.repositories.RoomRepository;
import com.skillstorm.hotelreservationsystem.repositories.RoomTypeRepository;

/**
 * Service class for employee room administration operations.
 * <p>
 * This service handles CRUD operations for managing physical rooms in the hotel,
 * including filtering, validation, and populating room type information.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Service
public class RoomAdminService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    /**
     * Constructs a new RoomAdminService with the required repositories.
     *
     * @param roomRepository The repository for room data access.
     * @param roomTypeRepository The repository for room type data access.
     */
    public RoomAdminService(RoomRepository roomRepository, RoomTypeRepository roomTypeRepository) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    /**
     * Lists all rooms with optional filtering criteria.
     *
     * @param roomTypeId Filter by room type ID (optional).
     * @param accessible Filter by accessibility status (optional).
     * @param petFriendly Filter by pet-friendly status (optional).
     * @param nonSmoking Filter by non-smoking status (optional).
     * @param occupied Filter by occupancy status (optional).
     * @return A list of rooms matching the criteria with populated room types.
     */
    public List<Room> listRooms(String roomTypeId, Boolean accessible, Boolean petFriendly, Boolean nonSmoking, Boolean occupied) {
        List<Room> rooms = roomRepository.findAll();

        rooms = rooms.stream()
                .filter(r -> roomTypeId == null || roomTypeId.equals(r.getRoomTypeId()))
                .filter(r -> accessible == null || r.isAccessible() == accessible)
                .filter(r -> petFriendly == null || r.isPetFriendly() == petFriendly)
                .filter(r -> nonSmoking == null || r.isNonSmoking() == nonSmoking)
                .filter(r -> occupied == null || r.isOccupied() == occupied)
                .collect(Collectors.toList());

        hydrateRoomTypes(rooms);
        return rooms;
    }

    /**
     * Retrieves a room by its unique identifier.
     *
     * @param id The unique identifier of the room.
     * @return The room with populated room type information.
     * @throws ResponseStatusException if the room is not found.
     */
    public Room getRoom(String id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found: " + id));
        hydrateRoomTypes(List.of(room));
        return room;
    }

    /**
     * Creates a new room.
     *
     * @param req The room details to create.
     * @return The created room with populated room type information.
     * @throws ResponseStatusException if the room number already exists or the room type is not found.
     */
    public Room createRoom(RoomUpsertRequest req) {
        if (roomRepository.existsByRoomNumber(req.roomNumber())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room number already exists: " + req.roomNumber());
        }
        if (!roomTypeRepository.existsById(req.roomTypeId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RoomType not found: " + req.roomTypeId());
        }

        Room room = new Room();
        room.setRoomNumber(req.roomNumber());
        room.setRoomTypeID(req.roomTypeId());

        room.setAccessible(Boolean.TRUE.equals(req.accessible()));
        room.setPetFriendly(Boolean.TRUE.equals(req.petFriendly()));
        room.setNonSmoking(Boolean.TRUE.equals(req.nonSmoking()));
        room.setOccupied(Boolean.TRUE.equals(req.occupied()));

        Room saved = roomRepository.save(room);
        hydrateRoomTypes(List.of(saved));
        return saved;
    }

    /**
     * Updates an existing room.
     *
     * @param id The unique identifier of the room to update.
     * @param req The updated room details (nullable fields allow selective updates).
     * @return The updated room with populated room type information.
     * @throws ResponseStatusException if the room is not found, room number conflicts, or room type is invalid.
     */
    public Room updateRoom(String id, RoomUpsertRequest req) {
        Room existing = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found: " + id));

        if (req.roomNumber() != null && !req.roomNumber().equals(existing.getRoomNumber())) {
            if (roomRepository.existsByRoomNumber(req.roomNumber())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room number already exists: " + req.roomNumber());
            }
            existing.setRoomNumber(req.roomNumber());
        }

        if (req.roomTypeId() != null && !req.roomTypeId().equals(existing.getRoomTypeId())) {
            if (!roomTypeRepository.existsById(req.roomTypeId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RoomType not found: " + req.roomTypeId());
            }
            existing.setRoomTypeID(req.roomTypeId());
        }

        if (req.accessible() != null) existing.setAccessible(req.accessible());
        if (req.petFriendly() != null) existing.setPetFriendly(req.petFriendly());
        if (req.nonSmoking() != null) existing.setNonSmoking(req.nonSmoking());
        if (req.occupied() != null) existing.setOccupied(req.occupied());

        Room saved = roomRepository.save(existing);
        hydrateRoomTypes(List.of(saved));
        return saved;
    }

    /**
     * Deletes a room by its ID.
     * <p>
     * Prevents deletion of occupied rooms to maintain data integrity.
     * </p>
     *
     * @param id The unique identifier of the room to delete.
     * @throws ResponseStatusException if the room is not found or is currently occupied.
     */
    public void deleteRoom(String id) {
        Room existing = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found: " + id));

        if (existing.isOccupied()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete an occupied room.");
        }

        roomRepository.deleteById(id);
    }

    /**
     * Populates room type information for a list of rooms.
     *
     * @param rooms The list of rooms to hydrate with room type data.
     */
    private void hydrateRoomTypes(List<Room> rooms) {
        Set<String> typeIds = rooms.stream()
                .map(Room::getRoomTypeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (typeIds.isEmpty()) return;

        List<RoomType> types = roomTypeRepository.findAllById(typeIds);
        Map<String, RoomType> byId = types.stream().collect(Collectors.toMap(RoomType::getId, t -> t));

        for (Room r : rooms) {
            if (r.getRoomTypeId() != null) {
                r.setRoomType(byId.get(r.getRoomTypeId()));
            }
        }
    }
}
