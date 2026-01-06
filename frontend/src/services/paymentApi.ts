import { apiSlice } from '../store/apiSlice'; // Import your MAIN api slice

// We use injectEndpoints instead of createApi
export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<{ clientSecret: string }, { amount: number; currency: string }>({
      query: (body) => ({
        // Note: We use the full path relative to your apiSlice BASE_URL
        // If apiSlice BASE_URL is 'http://localhost:8080', this becomes:
        // 'http://localhost:8080/payments/create-intent'
        url: '/payments/create-intent', 
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useCreatePaymentIntentMutation } = paymentApi;