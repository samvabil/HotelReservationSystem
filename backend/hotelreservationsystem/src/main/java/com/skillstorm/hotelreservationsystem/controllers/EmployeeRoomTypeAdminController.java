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

/**
 * REST controller for employee room type administration operations.
 * <p>
 * This controller handles HTTP requests for employees to manage room type definitions,
 * including creating, reading, updating, deleting room types, and uploading images.
 * All endpoints require employee authentication.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@RestController
@RequestMapping("employees/admin/room-types")
public class EmployeeRoomTypeAdminController {

    private final RoomTypeAdminService roomTypeAdminService;
    private final S3StorageService s3StorageService;

    /**
     * Constructs a new EmployeeRoomTypeAdminController with the specified services.
     *
     * @param roomTypeAdminService The service for room type administration operations.
     * @param s3StorageService The service for uploading images to S3.
     */
    public EmployeeRoomTypeAdminController(RoomTypeAdminService roomTypeAdminService, S3StorageService s3StorageService) {
        this.roomTypeAdminService = roomTypeAdminService;
        this.s3StorageService = s3StorageService;
    }

    /**
     * Lists all room types.
     *
     * @return A list of all room types in the system.
     */
    @GetMapping
    public List<RoomType> list() {
        return roomTypeAdminService.list();
    }

    /**
     * Retrieves a room type by its unique identifier.
     *
     * @param id The unique identifier of the room type.
     * @return The room type details.
     */
    @GetMapping("/{id}")
    public RoomType get(@PathVariable String id) {
        return roomTypeAdminService.get(id);
    }

    /**
     * Creates a new room type.
     *
     * @param req The room type details to create.
     * @return A ResponseEntity containing the created room type with HTTP 201 status.
     */
    @PostMapping
    public ResponseEntity<RoomType> create(@Valid @RequestBody RoomTypeUpsertRequest req) {
        RoomType created = roomTypeAdminService.create(req);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Updates an existing room type.
     *
     * @param id The unique identifier of the room type to update.
     * @param req The updated room type details.
     * @return The updated room type.
     */
    @PutMapping("/{id}")
    public RoomType update(@PathVariable String id, @Valid @RequestBody RoomTypeUpsertRequest req) {
        return roomTypeAdminService.update(id, req);
    }

    /**
     * Uploads an image for a room type to S3 and adds the URL to the room type.
     *
     * @param id The unique identifier of the room type.
     * @param file The image file to upload.
     * @return The updated room type with the new image URL added.
     */
    @PostMapping("/{id}/images")
    public RoomType uploadRoomTypeImage(@PathVariable String id, @RequestPart("file") MultipartFile file) {
        return roomTypeAdminService.addImage(id, s3StorageService.uploadRoomTypeImage(id, file));
    }

    /**
     * Deletes a room type by its ID.
     *
     * @param id The unique identifier of the room type to delete.
     * @return A ResponseEntity with no content and HTTP 204 status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        roomTypeAdminService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
