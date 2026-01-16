package com.skillstorm.hotelreservationsystem.dto;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object for creating or updating room type information.
 * <p>
 * This is a record class used for both creating new room types and updating existing ones.
 * Contains all specifications, amenities, and gaming equipment details for a room category.
 * </p>
 *
 * @param name The display name of the room type (required).
 * @param pricePerNight The base cost per night (required, must be >= 0).
 * @param numBeds The number of beds in the room (required, must be >= 0).
 * @param typeBed The size or type of beds (required).
 * @param numBedroom The number of separate bedrooms (required, must be >= 0).
 * @param squareFeet The total area in square feet (required, must be >= 0).
 * @param capacity The maximum number of guests allowed (required, must be >= 1).
 * @param hasJacuzzi Whether the room includes a jacuzzi (required).
 * @param hasKitchen Whether the room includes a kitchen (required).
 * @param levelOfPc The performance tier of gaming PCs (required, must be >= 0).
 * @param numPcs The number of gaming PC setups (required, must be >= 0).
 * @param consoles The list of gaming consoles available (optional).
 * @param images The list of image URLs for the room (optional).
 *
 * @author SkillStorm
 * @version 1.0
 */
public record RoomTypeUpsertRequest(
        @NotBlank String name,

        @NotNull @Min(0) Double pricePerNight,

        @NotNull @Min(0) Integer numBeds,
        @NotBlank String typeBed,
        @NotNull @Min(0) Integer numBedroom,

        @NotNull @Min(0) Integer squareFeet,
        @NotNull @Min(1) Integer capacity,

        @NotNull Boolean hasJacuzzi,
        @NotNull Boolean hasKitchen,

        @NotNull @Min(0) Integer levelOfPc,
        @NotNull @Min(0) Integer numPcs,

        List<String> consoles,
        List<String> images
) {}
