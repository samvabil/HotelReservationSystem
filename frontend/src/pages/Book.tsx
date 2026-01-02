import { Container, Typography, Box } from '@mui/material';
import SearchRoomsBar from '../components/SearchRoomsBar';
import RoomCard from '../components/RoomCard';
import { type RoomType } from '../types/RoomType';

// --- MOCK DATA: Room Types ---
const MOCK_ROOM_TYPES: RoomType[] = [
  {
    id: 'type-1',
    name: "Ultimate Gamer Suite",
    pricePerNight: 299.99,
    numBeds: 2,
    typeBed: "Queen",
    numBedrooms: 1,
    squareFeet: 650,
    capacity: 4,
    hasJacuzzi: true,
    hasKitchen: true,
    levelOfPc: 3, // High End
    numPcs: 2,
    consoles: ["PS5", "Xbox Series X", "Switch"],
    images: ["https://images.unsplash.com/photo-1616594039964-40891a904d08?q=80&w=1000"]
  },
  {
    id: 'type-2',
    name: "Co-Op Double",
    pricePerNight: 149.50,
    numBeds: 2,
    typeBed: "Twin",
    numBedrooms: 1,
    squareFeet: 350,
    capacity: 2,
    hasJacuzzi: false,
    hasKitchen: false,
    levelOfPc: 2, // Mid Range
    numPcs: 1,
    consoles: ["PS5"],
    images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1000"]
  }
];

export default function Book() {
  
  const handleSearchTrigger = () => {
    console.log("Fetching new room types...");
  };

  const handleSelectType = (roomTypeId: string) => {
    console.log("User selected Type ID:", roomTypeId);
    // TODO: Open Modal to show actual Rooms of this type (e.g., Room 101, Room 102)
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Find Your Perfect Stay
      </Typography>
      
      <Box sx={{ mb: 6 }}>
        <SearchRoomsBar onSearch={handleSearchTrigger} />
      </Box>

      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>
            Our Room Collections
        </Typography>
        
        {MOCK_ROOM_TYPES.map((type) => (
          <RoomCard 
            key={type.id} 
            roomType={type} 
            onBook={handleSelectType} 
          />
        ))}
      </Box>
    </Container>
  );
}