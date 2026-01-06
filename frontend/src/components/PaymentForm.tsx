import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button, Alert, Box, CircularProgress } from '@mui/material';

export default function PaymentForm({ totalCost }: { totalCost: number }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return; // Stripe hasn't loaded yet

    setIsProcessing(true);
    setErrorMessage(null);

    // 1. Confirm the payment with Stripe
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Where to go after payment succeeds
        return_url: `${window.location.origin}/booking-confirmation`, 
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "An unexpected error occurred.");
      setIsProcessing(false);
    } 
    // If success, stripe redirects automatically, so no need to set processing false
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        {/* THE STRIPE UI ELEMENT */}
        <PaymentElement />
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>
      )}

      <Button 
        type="submit" 
        variant="contained" 
        fullWidth 
        size="large"
        disabled={!stripe || isProcessing}
        sx={{ fontWeight: 'bold', py: 1.5 }}
      >
        {isProcessing ? <CircularProgress size={24} color="inherit" /> : `Pay $${totalCost.toFixed(2)}`}
      </Button>
    </form>
  );
}