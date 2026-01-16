package com.skillstorm.hotelreservationsystem.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.skillstorm.hotelreservationsystem.dto.RoomTypeUpsertRequest;
import com.skillstorm.hotelreservationsystem.models.RoomType;
import com.skillstorm.hotelreservationsystem.repositories.RoomRepository;
import com.skillstorm.hotelreservationsystem.repositories.RoomTypeRepository;

/**
 * Service class for employee room type administration operations.
 * <p>
 * This service handles CRUD operations for managing room type definitions,
 * including validation to prevent deletion of room types that are in use.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Service
public class RoomTypeAdminService {

    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;

    /**
     * Constructs a new RoomTypeAdminService with the required repositories.
     *
     * @param roomTypeRepository The repository for room type data access.
     * @param roomRepository The repository for room data access (used for validation).
     */
    public RoomTypeAdminService(RoomTypeRepository roomTypeRepository, RoomRepository roomRepository) {
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
    }

    /**
     * Lists all room types.
     *
     * @return A list of all room types in the system.
     */
    public List<RoomType> list() {
        return roomTypeRepository.findAll();
    }

    /**
     * Retrieves a room type by its unique identifier.
     *
     * @param id The unique identifier of the room type.
     * @return The room type details.
     * @throws ResponseStatusException if the room type is not found.
     */
    public RoomType get(String id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "RoomType not found: " + id));
    }

    /**
     * Creates a new room type.
     *
     * @param req The room type details to create.
     * @return The created room type.
     */
    public RoomType create(RoomTypeUpsertRequest req) {
        RoomType rt = new RoomType(
                req.name(),
                req.pricePerNight(),
                req.numBeds(),
                req.typeBed(),
                req.numBedroom(),
                req.squareFeet(),
                req.capacity(),
                req.hasJacuzzi(),
                req.hasKitchen(),
                req.levelOfPc(),
                req.numPcs(),
                req.consoles(),
                req.images()
        );
        return roomTypeRepository.save(rt);
    }

    /**
     * Updates an existing room type.
     *
     * @param id The unique identifier of the room type to update.
     * @param req The updated room type details.
     * @return The updated room type.
     * @throws ResponseStatusException if the room type is not found.
     */
    public RoomType update(String id, RoomTypeUpsertRequest req) {
        RoomType existing = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "RoomType not found: " + id));

        existing.setName(req.name());
        existing.setPricePerNight(req.pricePerNight());
        existing.setNumBeds(req.numBeds());
        existing.setTypeBed(req.typeBed());
        existing.setNumBedroom(req.numBedroom());
        existing.setSquareFeet(req.squareFeet());
        existing.setCapacity(req.capacity());
        existing.setHasJacuzzi(req.hasJacuzzi());
        existing.setHasKitchen(req.hasKitchen());
        existing.setLevelOfPc(req.levelOfPc());
        existing.setNumPcs(req.numPcs());
        existing.setConsoles(req.consoles());
        existing.setImages(req.images());

        return roomTypeRepository.save(existing);
    }

    /**
     * Deletes a room type by its ID.
     * <p>
     * Prevents deletion of room types that are currently assigned to one or more rooms
     * to maintain referential integrity.
     * </p>
     *
     * @param id The unique identifier of the room type to delete.
     * @throws ResponseStatusException if the room type is not found or is in use by existing rooms.
     */
    public void delete(String id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "RoomType not found: " + id);
        }

        long usageCount = roomRepository.countByRoomTypeId(id);
        if (usageCount > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot delete RoomType. It is used by " + usageCount + " room(s)."
            );
        }

        roomTypeRepository.deleteById(id);
    }

    /**
     * Adds an image URL to a room type's image list.
     *
     * @param roomTypeId The unique identifier of the room type.
     * @param imageUrl The image URL to add.
     * @return The updated room type with the new image added.
     * @throws ResponseStatusException if the room type is not found.
     */
    public RoomType addImage(String roomTypeId, String imageUrl) {
        RoomType existing = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "RoomType not found: " + roomTypeId));

        List<String> images = existing.getImages();
        if (images == null) {
            images = new java.util.ArrayList<>();
        }
        images.add(imageUrl);
        existing.setImages(images);

        return roomTypeRepository.save(existing);
    }
}
