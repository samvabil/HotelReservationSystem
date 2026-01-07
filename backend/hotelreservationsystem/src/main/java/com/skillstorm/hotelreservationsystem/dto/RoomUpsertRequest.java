package com.skillstorm.hotelreservationsystem.dto;

import jakarta.validation.constraints.NotBlank;

public record RoomUpsertRequest(
        @NotBlank String roomNumber,
        @NotBlank String roomTypeId,
        Boolean accessible,
        Boolean petFriendly,
        Boolean nonSmoking,
        Boolean occupied
) {}
