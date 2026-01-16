/**
 * Represents a category or configuration of rooms available in the hotel.
 * Unlike the Room interface which represents a specific physical room, this
 * defines the type of room (e.g., "Pro Gamer Suite", "Standard King").
 */
export interface RoomType {
  /** The unique identifier for the room type. */
  id: string;
  /** The display name of the room type (e.g., "Ultimate Gamer Suite"). */
  name: string;          // "Ultimate Gamer Suite"
  /** The base cost per night for this room type. */
  pricePerNight: number;
  
  /** The number of beds in the room. */
  numBeds: number;
  /** The size or type of the beds (e.g., "King", "Queen"). */
  typeBed: string;       // "King", "Queen"
  /** The number of separate bedrooms within the suite. */
  numBedroom: number;   // Mapped from Java 'numBeedroom'
  
  /** The total area of the room in square feet. */
  squareFeet: number;
  /** The maximum number of guests allowed to sleep in this room. */
  capacity: number;      // Max guests
  
  /** Indicates if the room includes a private jacuzzi. */
  hasJacuzzi: boolean;
  /** Indicates if the room includes a kitchenette or full kitchen. */
  hasKitchen: boolean;
  
  /** The performance tier of the gaming PC provided (e.g., 1=Entry, 2=Mid-Range, 3=High-End). */
  levelOfPc: number;     // 1, 2, or 3
  /** The number of gaming PC setups available in the room. */
  numPcs: number;
  /** A list of gaming consoles available in the room (e.g., ["PS5", "Switch"]). */
  consoles: string[];    // ["PS5", "Switch"]
  
  /** A list of URLs pointing to images of the room hosted on cloud storage. */
  images: string[];      // Array of URLs
}