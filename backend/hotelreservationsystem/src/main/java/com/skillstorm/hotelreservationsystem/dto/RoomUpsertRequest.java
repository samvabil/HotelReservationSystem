package com.skillstorm.hotelreservationsystem.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for creating or updating room information.
 * <p>
 * This is a record class used for both creating new rooms and updating existing ones.
 * Boolean fields are nullable to allow selective updates.
 * </p>
 *
 * @param roomNumber The physical room number or identifier (required).
 * @param roomTypeId The unique identifier of the room type this room belongs to (required).
 * @param accessible Whether the room is accessible (ADA compliant) (optional).
 * @param petFriendly Whether pets are allowed in the room (optional).
 * @param nonSmoking Whether the room is non-smoking (optional).
 * @param occupied Whether the room is currently physically occupied (optional).
 *
 * @author SkillStorm
 * @version 1.0
 */
public record RoomUpsertRequest(
        @NotBlank String roomNumber,
        @NotBlank String roomTypeId,
        Boolean accessible,
        Boolean petFriendly,
        Boolean nonSmoking,
        Boolean occupied
) {}
