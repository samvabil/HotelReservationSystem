import { type Room } from "./Room";
import { type RoomType } from "./RoomType";

/**
 * Represents a search result grouping rooms by their type.
 * Used to display available rooms organized by room type in search results.
 */
export interface RoomTypeSearchResult {
    /** The room type information (specifications, amenities, pricing). */
    roomType: RoomType;
    /** A list of available rooms of this type that match the search criteria. */
    availableRooms: Room[];
}