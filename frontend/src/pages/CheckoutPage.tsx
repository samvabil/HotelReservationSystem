import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Grid, Typography, Card, CardContent, Box, Divider, CircularProgress, Alert } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs'; 
import isBetween from 'dayjs/plugin/isBetween';

import { type RootState } from '../store/store';
import { setDatesAndGuests } from '../store/bookingSlice'; 
import { useGetRoomByIdQuery } from '../services/roomApi'; 
// 1. Import the Payment Mutation Hook
import { useCreatePaymentIntentMutation } from '../services/paymentApi';
import PaymentForm from '../components/PaymentForm';

// Enable the "isBetween" plugin for easier date range checks
dayjs.extend(isBetween);

// Stripe public key 
const stripePromise = loadStripe('pk_test_51Smfl3AXOOCAN7uB0saULNPwwO2HqxyRi0wAWeYqoeoQ1Tsyn1cLAXJBhCSPTlqRkTFgbeqyp3Us64NllGtYmhwT00Bo0ZaLY8');

export default function CheckoutPage() {
  const { roomId } = useParams(); 
  const dispatch = useDispatch();
  
  const { checkInDate, checkOutDate, guestCount } = useSelector((state: RootState) => state.booking);
  
  const { data: room, isLoading, isError } = useGetRoomByIdQuery(roomId || '', { skip: !roomId });

  // 2. Use RTK Query Mutation instead of raw fetch
  // createPaymentIntent = function to trigger the call
  // data = the response from backend (contains clientSecret)
  const [createPaymentIntent, { data: paymentData, isLoading: isPaymentLoading }] = useCreatePaymentIntentMutation();

  const clientSecret = paymentData?.clientSecret;
  
  // Convert Redux strings to Dayjs objects for the Pickers
  const checkIn = useMemo(() => checkInDate ? dayjs(checkInDate) : dayjs(), [checkInDate]);
  const checkOut = useMemo(() => checkOutDate ? dayjs(checkOutDate) : dayjs().add(1, 'day'), [checkOutDate]);

  // Calculations
  const nights = Math.max(1, checkOut.diff(checkIn, 'day'));
  const pricePerNight = room?.roomTypeId?.pricePerNight || 0;
  const subtotal = pricePerNight * nights;
  const taxes = subtotal * 0.08; 
  const total = subtotal + taxes;

  // 3. Trigger Payment Intent (Re-runs automatically when total changes)
  useEffect(() => {
    if (total > 0 && room) {
        createPaymentIntent({ 
            amount: Math.round(total * 100), 
            currency: 'usd' 
        });
    }
  }, [total, room, createPaymentIntent]);

  // Handle Date Changes (Dispatches immediately)
  const handleDateChange = (type: 'checkIn' | 'checkOut', newValue: Dayjs | null) => {
    if (!newValue) return;

    // Dispatching updates Redux -> Updates 'total' -> Updates Stripe Intent
    dispatch(setDatesAndGuests({
        checkIn: type === 'checkIn' ? newValue.format('YYYY-MM-DD') : checkIn.format('YYYY-MM-DD'),
        checkOut: type === 'checkOut' ? newValue.format('YYYY-MM-DD') : checkOut.format('YYYY-MM-DD'),
        guests: guestCount 
    }));
  };

  // Function to Disable Unavailable Dates
  const shouldDisableDate = (date: Dayjs) => {
    // Always disable past dates
    if (date.isBefore(dayjs(), 'day')) return true;

    // Check against room's unavailable ranges
    if (room?.unavailableDates) {
        return room.unavailableDates.some(range => {
            const start = dayjs(range.start);
            const end = dayjs(range.end);
            return date.isBetween(start, end, 'day', '[]'); 
        });
    }
    return false;
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (isError || !room) return <Alert severity="error">Room not found or unavailable.</Alert>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Secure Checkout
        </Typography>

        <Grid container spacing={4}>
            
            {/* LEFT COLUMN: ORDER SUMMARY */}
            <Grid size={{ xs: 12, md: 5 }}>
                <Card 
                    elevation={4} 
                    sx={{ 
                    bgcolor: 'background.paper', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                            Order Summary
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h5" fontWeight="bold">
                                {room?.roomTypeId?.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Room {room?.roomNumber}
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* ALWAYS VISIBLE DATE PICKERS */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                            <DatePicker 
                                label="Check-in" 
                                value={checkIn} 
                                onChange={(newValue) => handleDateChange('checkIn', newValue)}
                                shouldDisableDate={shouldDisableDate}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                            <DatePicker 
                                label="Check-out" 
                                value={checkOut} 
                                onChange={(newValue) => handleDateChange('checkOut', newValue)}
                                shouldDisableDate={shouldDisableDate}
                                minDate={checkIn.add(1, 'day')}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="text.secondary">
                                ${pricePerNight} x {nights} nights
                            </Typography>
                            <Typography fontWeight="medium">${subtotal.toFixed(2)}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography color="text.secondary">Taxes & Fees (8%)</Typography>
                            <Typography fontWeight="medium">${taxes.toFixed(2)}</Typography>
                        </Box>
                        
                        <Divider sx={{ my: 2, borderColor: 'primary.main', borderWidth: 1 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Total</Typography>
                            <Typography variant="h4" fontWeight="bold" color="secondary.main">
                                ${total.toFixed(2)}
                            </Typography>
                        </Box>

                    </CardContent>
                </Card>
            </Grid>

            {/* RIGHT COLUMN: PAYMENT FORM */}
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
                                    {isPaymentLoading ? "Updating price..." : "Securing connection..."}
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

        </Grid>
        </Container>
    </LocalizationProvider>
  );
}