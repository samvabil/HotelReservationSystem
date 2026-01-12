import { type FormEvent, useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { useCreateReservationMutation } from '../services/reservationApi';
import { clearBookingState } from '../store/bookingSlice';

interface PaymentFormProps {
  totalCost: number;
  roomId: string;
  onSuccess: () => void; // <--- NEW PROP
}

export default function PaymentForm({ totalCost, roomId, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  // Get booking details from Redux
  const { checkInDate, checkOutDate, guestCount } = useSelector((state: RootState) => state.booking);

  // Hook to call our new backend endpoint
  const [createReservation] = useCreateReservationMutation();

  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    // 1. Confirm Payment with Stripe
    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Prevents auto-redirect
    });

    if (result.error) {
      setMessage(result.error.message || "Payment failed");
      setIsProcessing(false);
    } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
      
      // 2. PAYMENT SUCCESS! Now save to database.
      try {
        await createReservation({
          roomId: roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guestCount: guestCount,
          paymentIntentId: result.paymentIntent.id
        }).unwrap();

        // 3. Success! Clear state and Trigger Modal
        dispatch(clearBookingState());
        
        onSuccess(); // <--- CALL PARENT HANDLER INSTEAD OF NAVIGATING

      } catch (err) {
        console.error("Database Error:", err);
        setMessage("Payment succeeded, but reservation failed. Please contact support.");
      }
      
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      
      {message && <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert>}
      
      <Button 
        type="submit" 
        variant="contained" 
        fullWidth 
        disabled={isProcessing || !stripe || !elements}
        sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
      >
        {isProcessing ? "Processing..." : `Pay $${totalCost.toFixed(2)}`}
      </Button>
    </form>
  );
}