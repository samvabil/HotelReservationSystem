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

@RestController
@RequestMapping("/api/employees/admin/rooms")
public class EmployeeRoomAdminController {

    private final RoomAdminService roomAdminService;

    public EmployeeRoomAdminController(RoomAdminService roomAdminService) {
        this.roomAdminService = roomAdminService;
    }

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

    @GetMapping("/{id}")
    public Room getRoom(@PathVariable String id) {
        return roomAdminService.getRoom(id);
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@Valid @RequestBody RoomUpsertRequest req) {
        Room created = roomAdminService.createRoom(req);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public Room updateRoom(@PathVariable String id, @Valid @RequestBody RoomUpsertRequest req) {
        return roomAdminService.updateRoom(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {
        roomAdminService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
