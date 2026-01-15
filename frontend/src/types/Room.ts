import { type RoomType } from "./RoomType";

export interface UnavailableDate {
  start: string; // ISO Date String
  end: string;   // ISO Date String
}

export interface Room {
  id: string;
  roomNumber: string;    // "101"
  roomTypeId: RoomType;    // The full object (or just ID depending on API depth)
  
  // Specific features of this physical room
  accessible: boolean;
  petFriendly: boolean;
  nonSmoking: boolean;
  occupied: boolean;
  
  unavailableDates: UnavailableDate[];
}