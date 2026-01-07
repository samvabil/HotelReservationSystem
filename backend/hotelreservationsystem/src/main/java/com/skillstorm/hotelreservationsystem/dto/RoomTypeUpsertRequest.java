package com.skillstorm.hotelreservationsystem.dto;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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
