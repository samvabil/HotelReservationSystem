import { useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { useSearchRoomsQuery } from '../services/roomApi';
import SearchRoomsBar from '../components/SearchRoomsBar';
import RoomCard from '../components/RoomCard';
import { useNavigate } from 'react-router-dom';
import { clearBookingState } from '../store/bookingSlice'; // 1. Import Action
import dayjs from 'dayjs'; // 2. Import Dayjs

export default function Book() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // 3. Init Dispatch

  // Get search criteria from Redux
  const bookingState = useSelector((state: RootState) => state.booking);

  // 4. SMART CLEANUP: Clear state only if dates are in the past
  // This fixes the "days old dates" bug but keeps valid dates if a user 
  // is redirected back here after logging in during a booking flow.
  useEffect(() => {
    if (bookingState.checkInDate) {
        // Check if the saved check-in date is before today
        const isStale = dayjs(bookingState.checkInDate).isBefore(dayjs(), 'day');
        
        if (isStale) {
            console.log("Found stale dates in history. Resetting search...");
            dispatch(clearBookingState());
        }
    }
  }, [dispatch, bookingState.checkInDate]);

  // User must have selected dates and guests to proceed
  const canBook = !!(bookingState.checkInDate && bookingState.checkOutDate && bookingState.guestCount > 0);

  const { 
    data: results, 
    isLoading, 
    isFetching, 
    isError 
  } = useSearchRoomsQuery(bookingState);

  const handleBookRoom = (roomTypeId: string) => {
    if (!canBook) {
        // This fallback alert should rarely be seen since the button is disabled
        alert("Please select check-in and check-out dates first.");
        return;
    }

    const foundResult = results?.find(r => r.roomType.id === roomTypeId);

    if (foundResult && foundResult.availableRooms.length > 0) {
      const roomId = foundResult.availableRooms[0].id;
      navigate(`/checkout/${roomId}`);
    } else {
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
                    onBook={handleBookRoom} 
                    disabled={!canBook} 
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