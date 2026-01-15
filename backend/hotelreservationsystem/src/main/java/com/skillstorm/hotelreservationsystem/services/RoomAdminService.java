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

@Service
public class RoomAdminService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    public RoomAdminService(RoomRepository roomRepository, RoomTypeRepository roomTypeRepository) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

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

    public Room getRoom(String id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found: " + id));
        hydrateRoomTypes(List.of(room));
        return room;
    }

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

    public void deleteRoom(String id) {
        Room existing = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found: " + id));

        if (existing.isOccupied()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete an occupied room.");
        }

        roomRepository.deleteById(id);
    }

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
