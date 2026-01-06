import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Grid, Typography, Card, CardContent, Box, Divider, CircularProgress, Chip, Alert } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import dayjs from 'dayjs'; 

import { type RootState } from '../store/store';
import { useGetRoomByIdQuery } from '../services/roomApi'; 
import PaymentForm from '../components/PaymentForm';

// Replace with your Stripe Publishable Key
const stripePromise = loadStripe('pk_test_YOUR_KEY_HERE');

export default function CheckoutPage() {
  const { roomId } = useParams(); 
  
  const navigate = useNavigate();
  
  // 1. UPDATED: Destructure the flat fields directly
  const { checkInDate, checkOutDate } = useSelector((state: RootState) => state.booking);
  
  const { data: room, isLoading, isError } = useGetRoomByIdQuery(roomId || '', { skip: !roomId });

  const [clientSecret, setClientSecret] = useState('');

  // 2. UPDATED: Use the flat fields here
  const checkIn = dayjs(checkInDate);
  const checkOut = dayjs(checkOutDate);
  const nights = Math.max(1, checkOut.diff(checkIn, 'day'));
  
  const pricePerNight = room?.roomTypeId?.pricePerNight || 0;
  const subtotal = pricePerNight * nights;
  const taxes = subtotal * 0.08; 
  const total = subtotal + taxes;

  useEffect(() => {
    if (total > 0 && room) {
      fetch('http://localhost:8080/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100), currency: 'usd' }) 
      })
      .then(async (res) => {
          if (!res.ok) throw new Error("Failed to init payment");
          return res.json();
      })
      .then(data => setClientSecret(data.clientSecret))
      .catch(err => console.error("Payment Init Error:", err));
    }
  }, [total, room]);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (isError || !room) return <Alert severity="error">Room not found or unavailable.</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
       <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
         Secure Checkout
       </Typography>

       <Grid container spacing={4}>
         
         <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={3} sx={{ p: 2 }}>
               <CardContent>
                  <Typography variant="h6" gutterBottom>Payment Details</Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                       <PaymentForm totalCost={total} />
                    </Elements>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Securing connection to Stripe...
                      </Typography>
                    </Box>
                  )}
               </CardContent>
            </Card>
         </Grid>

         <Grid size={{ xs: 12, md: 5 }}>
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
               <CardContent>
                  <Typography variant="h6" gutterBottom>Order Summary</Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {room.roomTypeId.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                       Room {room.roomNumber}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                     <Chip label={`Check-in: ${checkIn.format('MMM D')}`} />
                     <Chip label={`Check-out: ${checkOut.format('MMM D')}`} />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                     <Typography>${pricePerNight} x {nights} nights</Typography>
                     <Typography>${subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                     <Typography>Taxes & Fees (8%)</Typography>
                     <Typography>${taxes.toFixed(2)}</Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                     <Typography variant="h5" fontWeight="bold">Total</Typography>
                     <Typography variant="h5" fontWeight="bold" color="primary">
                        ${total.toFixed(2)}
                     </Typography>
                  </Box>
               </CardContent>
            </Card>
         </Grid>
       </Grid>
    </Container>
  );
}