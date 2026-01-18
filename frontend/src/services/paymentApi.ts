import { apiSlice } from '../store/apiSlice'; // Import your MAIN api slice

/**
 * RTK Query API endpoints for payment processing operations.
 * We use injectEndpoints instead of createApi to add endpoints to the main API slice.
 */
export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Creates a new Stripe payment intent for processing a payment.
     * 
     * @param body - The payment information including amount (in cents) and currency
     * @returns A payment intent with client secret for completing the payment on the frontend
     */
    createPaymentIntent: builder.mutation<{ clientSecret: string }, { amount: number; currency: string }>({
      query: (body) => ({
        // Note: We use the full path relative to your apiSlice BASE_URL
        // If apiSlice BASE_URL is 'https://d28qsoaj3pey5k.cloudfront.net', this becomes:
        // 'https://d28qsoaj3pey5k.cloudfront.net/api/payments/create-intent'
        url: '/api/payments/create-intent', 
        method: 'POST',
        body,
      }),
    }),
  }),
});

/**
 * Exported hook for usage in functional components.
 * 
 * - useCreatePaymentIntentMutation: Hook to create a Stripe payment intent
 */
export const { useCreatePaymentIntentMutation } = paymentApi;