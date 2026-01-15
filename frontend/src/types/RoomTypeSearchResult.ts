import { type Room } from "./Room";
import { type RoomType } from "./RoomType";

export interface RoomTypeSearchResult {
    roomType: RoomType;
    availableRooms: Room[];
}