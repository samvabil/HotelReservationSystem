import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useSelector, useDispatch } from 'react-redux';
import { 
    Container, Grid, Typography, Card, CardContent, Box, Divider, 
    CircularProgress, Alert, Dialog, DialogContent, DialogActions, Button 
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs'; 
import isBetween from 'dayjs/plugin/isBetween';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Added Icon

import { type RootState } from '../store/store';
import { setDatesAndGuests } from '../store/bookingSlice'; 
import { useGetRoomByIdQuery } from '../services/roomApi'; 
import { useCreatePaymentIntentMutation } from '../services/paymentApi';
import PaymentForm from '../components/PaymentForm';

dayjs.extend(isBetween);

const stripePromise = loadStripe('pk_test_51Smfl3AXOOCAN7uB0saULNPwwO2HqxyRi0wAWeYqoeoQ1Tsyn1cLAXJBhCSPTlqRkTFgbeqyp3Us64NllGtYmhwT00Bo0ZaLY8');

export default function CheckoutPage() {
  const { roomId } = useParams(); 
  const navigate = useNavigate(); // Init Hook
  const dispatch = useDispatch();
  
  // State for Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { checkInDate, checkOutDate, guestCount } = useSelector((state: RootState) => state.booking);
  const { data: room, isLoading, isError } = useGetRoomByIdQuery(roomId || '', { skip: !roomId });
  const [createPaymentIntent, { data: paymentData, isLoading: isPaymentLoading }] = useCreatePaymentIntentMutation();

  const clientSecret = paymentData?.clientSecret;
  
  const checkIn = useMemo(() => checkInDate ? dayjs(checkInDate) : dayjs(), [checkInDate]);
  const checkOut = useMemo(() => checkOutDate ? dayjs(checkOutDate) : dayjs().add(1, 'day'), [checkOutDate]);

  const nights = Math.max(1, checkOut.diff(checkIn, 'day'));
  const pricePerNight = room?.roomTypeId?.pricePerNight || 0;
  const subtotal = pricePerNight * nights;
  const taxes = subtotal * 0.08; 
  const total = subtotal + taxes;

  useEffect(() => {
    if (!checkInDate || !checkOutDate) {
        const defaultCheckIn = dayjs().format('YYYY-MM-DD');
        const defaultCheckOut = dayjs().add(1, 'day').format('YYYY-MM-DD');
        dispatch(setDatesAndGuests({ checkIn: defaultCheckIn, checkOut: defaultCheckOut, guests: guestCount || 2 }));
    }
  }, [checkInDate, checkOutDate, guestCount, dispatch]);

  useEffect(() => {
    if (total > 0 && room) {
        createPaymentIntent({ amount: Math.round(total * 100), currency: 'usd' });
    }
  }, [total, room, createPaymentIntent]);

  const handleDateChange = (type: 'checkIn' | 'checkOut', newValue: Dayjs | null) => {
    if (!newValue) return;
    dispatch(setDatesAndGuests({
        checkIn: type === 'checkIn' ? newValue.format('YYYY-MM-DD') : checkIn.format('YYYY-MM-DD'),
        checkOut: type === 'checkOut' ? newValue.format('YYYY-MM-DD') : checkOut.format('YYYY-MM-DD'),
        guests: guestCount 
    }));
  };

  const shouldDisableDate = (date: Dayjs) => {
    if (date.isBefore(dayjs(), 'day')) return true;
    if (room?.unavailableDates) {
        return room.unavailableDates.some(range => date.isBetween(dayjs(range.start), dayjs(range.end), 'day', '[]')); 
    }
    return false;
  };

  // --- HANDLER PASSED TO PAYMENT FORM ---
  const handlePaymentSuccess = () => {
    setShowSuccessModal(true);
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
                <Card elevation={4} sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>Order Summary</Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h5" fontWeight="bold">{room?.roomTypeId?.name}</Typography>
                            <Typography variant="body1" color="text.secondary">Room {room?.roomNumber}</Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                            <DatePicker 
                                label="Check-in" value={checkIn} onChange={(v) => handleDateChange('checkIn', v)} shouldDisableDate={shouldDisableDate} slotProps={{ textField: { fullWidth: true } }}
                            />
                            <DatePicker 
                                label="Check-out" value={checkOut} onChange={(v) => handleDateChange('checkOut', v)} shouldDisableDate={shouldDisableDate} minDate={checkIn.add(1, 'day')} slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="text.secondary">${pricePerNight} x {nights} nights</Typography>
                            <Typography fontWeight="medium">${subtotal.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Total</Typography>
                            <Typography variant="h4" fontWeight="bold" color="secondary.main">${total.toFixed(2)}</Typography>
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
                                {/* Pass the Success Handler Here */}
                                <PaymentForm 
                                    totalCost={total} 
                                    roomId={roomId || ''} 
                                    onSuccess={handlePaymentSuccess} 
                                />
                            </Elements>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CircularProgress />
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>{isPaymentLoading ? "Updating price..." : "Securing connection..."}</Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>

        {/* --- SUCCESS MODAL --- */}
        <Dialog 
            open={showSuccessModal} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, textAlign: 'center', p: 2 } }}
        >
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
                <Typography variant="h4" fontWeight="bold">Payment Successful!</Typography>
                <Typography variant="body1" color="text.secondary">
                    Your reservation has been confirmed. You will receive an email shortly with your booking details.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 4 }}>
                <Button 
                    variant="contained" 
                    size="large" 
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </Button>
                <Button 
                    variant="contained" 
                    size="large" 
                    onClick={() => navigate('/account')}
                >
                    Go to My Account
                </Button>
            </DialogActions>
        </Dialog>

        </Container>
    </LocalizationProvider>
  );
}