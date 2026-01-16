package com.skillstorm.hotelreservationsystem.controllers;

import com.skillstorm.hotelreservationsystem.dto.BookingSearchRequest;
import com.skillstorm.hotelreservationsystem.dto.BookingSearchResult;
import com.skillstorm.hotelreservationsystem.models.Room;
import com.skillstorm.hotelreservationsystem.services.RoomService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for managing room operations and searches.
 * <p>
 * This controller handles HTTP requests related to retrieving room information
 * and searching for available rooms based on various criteria such as dates,
 * amenities, and gaming equipment.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@RestController
@RequestMapping("/rooms")
public class RoomController {

    private final RoomService roomService;

    /**
     * Constructs a new RoomController with the specified service.
     *
     * @param roomService The service for room operations.
     */
    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    /**
     * Retrieves a room by its unique identifier.
     *
     * @param id The unique identifier of the room.
     * @return A ResponseEntity containing the room with HTTP 200 status.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable String id) {
        Room room = roomService.getRoomById(id);
        return new ResponseEntity<>(room, HttpStatus.OK);
    }

    /**
     * Searches for available rooms matching the specified criteria.
     * <p>
     * All search parameters are optional. The search filters rooms based on:
     * - Date availability (check-in/check-out)
     * - Guest capacity
     * - Price range
     * - Room specifications (beds, bedrooms)
     * - Amenities (accessibility, pet-friendly, non-smoking, jacuzzi)
     * - Gaming equipment (PC count, PC tier, consoles)
     * </p>
     *
     * @param checkIn The desired check-in date.
     * @param checkOut The desired check-out date.
     * @param guests The number of guests.
     * @param minPrice The minimum price per night.
     * @param maxPrice The maximum price per night.
     * @param minBeds The minimum number of beds required.
     * @param minBedrooms The minimum number of bedrooms required.
     * @param accessible Whether the room must be accessible.
     * @param petFriendly Whether the room must allow pets.
     * @param nonSmoking Whether the room must be non-smoking.
     * @param hasJacuzzi Whether the room must have a jacuzzi.
     * @param pcCount The required number of gaming PCs.
     * @param pcTier The required PC performance tier.
     * @param consoles The list of required gaming consoles.
     * @return A list of matching room search results.
     */
    @GetMapping("/search")
    public List<BookingSearchResult> searchRooms(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) Integer guests,
            
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            
            @RequestParam(required = false) Integer minBeds,
            @RequestParam(required = false) Integer minBedrooms,

            @RequestParam(required = false) Boolean accessible,
            @RequestParam(required = false) Boolean petFriendly,
            @RequestParam(required = false) Boolean nonSmoking,
            @RequestParam(required = false) Boolean hasJacuzzi,
            
            @RequestParam(required = false) Integer pcCount,
            @RequestParam(required = false) String pcTier,
            @RequestParam(required = false) List<String> consoles
    ) {
        // Map params to DTO
        BookingSearchRequest request = new BookingSearchRequest();
        request.setCheckInDate(checkIn);
        request.setCheckOutDate(checkOut);
        request.setGuestCount(guests);
        request.setMinPrice(minPrice);
        request.setMaxPrice(maxPrice);
        request.setMinBeds(minBeds);
        request.setMinBedrooms(minBedrooms);
        request.setAccessible(accessible);
        request.setPetFriendly(petFriendly);
        request.setNonSmoking(nonSmoking);
        request.setHasJacuzzi(hasJacuzzi);
        request.setPcCount(pcCount);
        request.setPcTier(pcTier);
        request.setConsoles(consoles);

        return roomService.searchRoomTypes(request);
    }
}