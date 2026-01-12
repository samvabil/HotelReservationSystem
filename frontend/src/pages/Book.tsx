import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { useSearchRoomsQuery } from '../services/roomApi';
import SearchRoomsBar from '../components/SearchRoomsBar';
import RoomCard from '../components/RoomCard';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

export default function Book() {
  const navigate = useNavigate(); // 2. Initialize hook

  // Get search criteria from Redux
  const bookingState = useSelector((state: RootState) => state.booking);

  // RTK Query automatically refetches whenever 'bookingState' changes
  const { 
    data: results, 
    isLoading, 
    isFetching, 
    isError 
  } = useSearchRoomsQuery(bookingState);

  // 3. New Logic: Auto-pick the first available room
  const handleBookRoom = (roomTypeId: string) => {
    // Find the result object for the clicked type
    const foundResult = results?.find(r => r.roomType.id === roomTypeId);

    if (foundResult && foundResult.availableRooms.length > 0) {
      // GRAB THE FIRST ROOM
      // Since the backend filtered them, any room in this list matches the user's criteria
      const roomId = foundResult.availableRooms[0].id;
      
      // Redirect immediately
      navigate(`/checkout/${roomId}`);
    } else {
      // Fallback safety (shouldn't happen if the card is displayed)
      alert("Sorry, we just ran out of rooms for this type! Please try another.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Find Your Perfect Stay
      </Typography>
      
      {/* Search Bar */}
      <Box sx={{ mb: 6 }}>
        <SearchRoomsBar onSearch={() => { /* No-op: Redux handles the trigger */ }} />
      </Box>

      {/* Results Section */}
      <Box>
        <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            Our Room Collections
            {isFetching && <CircularProgress size={20} />} 
        </Typography>

        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Unable to load rooms. Please try again later.
          </Alert>
        )}
        
        {isLoading && !results ? (
             <Box sx={{ textAlign: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Finding the best setup for you...</Typography>
             </Box>
        ) : (
            <>
                {results?.map((result) => (
                <RoomCard 
                    key={result.roomType.id} 
                    roomType={result.roomType} 
                    onBook={handleBookRoom} // Pass the auto-pick handler
                />
                ))}

                {results?.length === 0 && (
                    <Alert severity="info" variant="outlined">
                        No rooms match your specific criteria. Try removing some filters!
                    </Alert>
                )}
            </>
        )}
      </Box>
    </Container>
  );
}