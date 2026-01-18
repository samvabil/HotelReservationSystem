package com.skillstorm.hotelreservationsystem.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.hotelreservationsystem.dto.RoomUpsertRequest;
import com.skillstorm.hotelreservationsystem.models.Room;
import com.skillstorm.hotelreservationsystem.services.RoomAdminService;

import jakarta.validation.Valid;

/**
 * REST controller for employee room administration operations.
 * <p>
 * This controller handles HTTP requests for employees to manage physical rooms,
 * including creating, reading, updating, and deleting rooms. All endpoints require
 * employee authentication.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@RestController
@RequestMapping("employees/admin/rooms")
public class EmployeeRoomAdminController {

    private final RoomAdminService roomAdminService;

    /**
     * Constructs a new EmployeeRoomAdminController with the specified service.
     *
     * @param roomAdminService The service for room administration operations.
     */
    public EmployeeRoomAdminController(RoomAdminService roomAdminService) {
        this.roomAdminService = roomAdminService;
    }

    /**
     * Lists all rooms with optional filtering criteria.
     *
     * @param roomTypeId Filter by room type ID (optional).
     * @param accessible Filter by accessibility status (optional).
     * @param petFriendly Filter by pet-friendly status (optional).
     * @param nonSmoking Filter by non-smoking status (optional).
     * @param occupied Filter by occupancy status (optional).
     * @return A list of rooms matching the criteria.
     */
    @GetMapping
    public List<Room> listRooms(
            @RequestParam(required = false) String roomTypeId,
            @RequestParam(required = false) Boolean accessible,
            @RequestParam(required = false) Boolean petFriendly,
            @RequestParam(required = false) Boolean nonSmoking,
            @RequestParam(required = false) Boolean occupied
    ) {
        return roomAdminService.listRooms(roomTypeId, accessible, petFriendly, nonSmoking, occupied);
    }

    /**
     * Retrieves a room by its unique identifier.
     *
     * @param id The unique identifier of the room.
     * @return The room details.
     */
    @GetMapping("/{id}")
    public Room getRoom(@PathVariable String id) {
        return roomAdminService.getRoom(id);
    }

    /**
     * Creates a new room.
     *
     * @param req The room details to create.
     * @return A ResponseEntity containing the created room with HTTP 201 status.
     */
    @PostMapping
    public ResponseEntity<Room> createRoom(@Valid @RequestBody RoomUpsertRequest req) {
        Room created = roomAdminService.createRoom(req);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Updates an existing room.
     *
     * @param id The unique identifier of the room to update.
     * @param req The updated room details.
     * @return The updated room.
     */
    @PutMapping("/{id}")
    public Room updateRoom(@PathVariable String id, @Valid @RequestBody RoomUpsertRequest req) {
        return roomAdminService.updateRoom(id, req);
    }

    /**
     * Deletes a room by its ID.
     *
     * @param id The unique identifier of the room to delete.
     * @return A ResponseEntity with no content and HTTP 204 status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {
        roomAdminService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
