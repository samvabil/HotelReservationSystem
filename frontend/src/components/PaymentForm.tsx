import { useState, type FormEvent } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button, Alert } from '@mui/material';

/**
 * Props for the PaymentForm component.
 */
interface PaymentFormProps {
  /** The total cost to charge (in dollars). */
  totalCost: number;
  /** The room ID (currently unused but kept for potential future use). */
  roomId: string;
  /** Callback function invoked when payment succeeds. Receives the Stripe payment intent ID. */
  onSuccess: (paymentIntentId: string) => void; 
}

/**
 * Stripe payment form component for processing reservations.
 * <p>
 * Uses Stripe Elements to collect payment information and process payments.
 * On successful payment, calls the onSuccess callback with the payment intent ID.
 * The actual reservation creation/update is handled by the parent component (CheckoutPage).
 * </p>
 *
 * @param {PaymentFormProps} props - Component props.
 * @returns {JSX.Element} A form with Stripe payment elements and submit button.
 */
export default function PaymentForm({ totalCost, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    // 1. Confirm Payment with Stripe
    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Prevents auto-redirect so we can handle logic here
    });

    if (result.error) {
      // Show error to user (e.g., insufficient funds)
      setMessage(result.error.message || "Payment failed");
      setIsProcessing(false);
    } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
      
      // 2. PAYMENT SUCCESS! 
      // Do NOT create the reservation here. 
      // Just pass the ID back to CheckoutPage, which decides if it's a "Create" or "Update".
      onSuccess(result.paymentIntent.id);
      
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