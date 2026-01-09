// src/main/java/com/skillstorm/hotelreservationsystem/services/RoomTypeAdminService.java
package com.skillstorm.hotelreservationsystem.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.skillstorm.hotelreservationsystem.dto.RoomTypeUpsertRequest;
import com.skillstorm.hotelreservationsystem.models.RoomType;
import com.skillstorm.hotelreservationsystem.repositories.RoomRepository;
import com.skillstorm.hotelreservationsystem.repositories.RoomTypeRepository;

@Service
public class RoomTypeAdminService {

    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;

    public RoomTypeAdminService(RoomTypeRepository roomTypeRepository, RoomRepository roomRepository) {
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
    }

    public List<RoomType> list() {
        return roomTypeRepository.findAll();
    }

    public RoomType get(String id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "RoomType not found: " + id));
    }

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
}
