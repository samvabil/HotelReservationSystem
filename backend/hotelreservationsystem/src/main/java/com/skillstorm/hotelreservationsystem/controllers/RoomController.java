package com.skillstorm.hotelreservationsystem.controllers;

import com.skillstorm.hotelreservationsystem.dto.BookingSearchRequest;
import com.skillstorm.hotelreservationsystem.dto.BookingSearchResult;
import com.skillstorm.hotelreservationsystem.models.RoomType;
import com.skillstorm.hotelreservationsystem.services.RoomService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/rooms")
//@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

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