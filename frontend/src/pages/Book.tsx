import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { useSearchRoomsQuery } from '../services/roomApi';
import SearchRoomsBar from '../components/SearchRoomsBar';
import RoomCard from '../components/RoomCard';

export default function Book() {
  // 1. Get the current search criteria from Redux
  const bookingState = useSelector((state: RootState) => state.booking);

  // 2. Pass that state into the API Hook
  // RTK Query automatically refetches whenever 'bookingState' changes!
  const { 
    data: results, 
    isLoading, 
    isFetching, // True when refetching in background
    isError 
  } = useSearchRoomsQuery(bookingState);

  const handleSelectType = (roomTypeId: string) => {
    console.log("User selected Type ID:", roomTypeId);
    // TODO: Open Modal using this ID
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Find Your Perfect Stay
      </Typography>
      
      {/* Search Bar - This updates Redux, which triggers the query above */}
      <Box sx={{ mb: 6 }}>
        <SearchRoomsBar onSearch={() => { /* No-op: The Redux state change triggers the fetch */ }} />
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
             // Initial Loading State Skeleton
             <Box sx={{ textAlign: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Finding the best setup for you...</Typography>
             </Box>
        ) : (
            // Results List
            <>
                {results?.map((result) => (
                <RoomCard 
                    key={result.roomType.id} 
                    roomType={result.roomType} 
                    onBook={handleSelectType} 
                    // Optional: You could pass 'availableCount' to the card if you want to show urgency
                    // availableCount={result.availableRooms.length}
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