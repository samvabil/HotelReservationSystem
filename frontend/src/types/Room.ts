import { type RoomType } from "./RoomType";

/**
 * Represents a date range during which a room is unavailable.
 */
export interface UnavailableDate {
  /** The start date of the unavailability range in ISO format. */
  start: string; // ISO Date String
  /** The end date of the unavailability range in ISO format. */
  end: string;   // ISO Date String
}

/**
 * Represents a physical room in the hotel.
 */
export interface Room {
  /** The unique identifier for the room. */
  id: string;
  /** The physical room number or identifier (e.g., "101"). */
  roomNumber: string;    // "101"
  /** The room type object containing specifications and pricing. */
  roomTypeId: RoomType;    // The full object (or just ID depending on API depth)
  
  /** Indicates if the room meets accessibility standards (ADA compliant). */
  accessible: boolean;
  /** Indicates if pets are allowed in this room. */
  petFriendly: boolean;
  /** Indicates if this is a non-smoking room. */
  nonSmoking: boolean;
  /** The current real-time occupancy status (true if a guest is currently checked in). */
  occupied: boolean;
  
  /** A list of date ranges during which this room cannot be booked. */
  unavailableDates: UnavailableDate[];
}