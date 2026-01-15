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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.skillstorm.hotelreservationsystem.dto.RoomTypeUpsertRequest;
import com.skillstorm.hotelreservationsystem.models.RoomType;
import com.skillstorm.hotelreservationsystem.services.RoomTypeAdminService;
import com.skillstorm.hotelreservationsystem.services.S3StorageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/employees/admin/room-types")
public class EmployeeRoomTypeAdminController {

    private final RoomTypeAdminService roomTypeAdminService;
    private final S3StorageService s3StorageService;

    public EmployeeRoomTypeAdminController(RoomTypeAdminService roomTypeAdminService, S3StorageService s3StorageService) {
        this.roomTypeAdminService = roomTypeAdminService;
        this.s3StorageService = s3StorageService;
    }

    @GetMapping
    public List<RoomType> list() {
        return roomTypeAdminService.list();
    }

    @GetMapping("/{id}")
    public RoomType get(@PathVariable String id) {
        return roomTypeAdminService.get(id);
    }

    @PostMapping
    public ResponseEntity<RoomType> create(@Valid @RequestBody RoomTypeUpsertRequest req) {
        RoomType created = roomTypeAdminService.create(req);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public RoomType update(@PathVariable String id, @Valid @RequestBody RoomTypeUpsertRequest req) {
        return roomTypeAdminService.update(id, req);
    }

    @PostMapping("/{id}/images")
    public RoomType uploadRoomTypeImage(@PathVariable String id, @RequestPart("file") MultipartFile file) {
        return roomTypeAdminService.addImage(id, s3StorageService.uploadRoomTypeImage(id, file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        roomTypeAdminService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
