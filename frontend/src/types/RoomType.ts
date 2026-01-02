export interface RoomType {
  id: string;
  name: string;          // "Ultimate Gamer Suite"
  pricePerNight: number;
  
  // Bed Config
  numBeds: number;
  typeBed: string;       // "King", "Queen"
  numBedrooms: number;   // Mapped from Java 'numBeedroom'
  
  // Specs
  squareFeet: number;
  capacity: number;      // Max guests
  
  // Amenities
  hasJacuzzi: boolean;
  hasKitchen: boolean;
  
  // Gaming Gear
  levelOfPc: number;     // 1, 2, or 3
  numPcs: number;
  consoles: string[];    // ["PS5", "Switch"]
  
  // Media
  images: string[];      // Array of URLs
}