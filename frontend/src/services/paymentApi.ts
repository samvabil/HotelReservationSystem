import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  // Ensure the baseUrl matches your backend controller path structure
  baseQuery: fetchBaseQuery({ 
      baseUrl: 'http://localhost:8080/payments',
      // CRITICAL: This sends cookies/auth with every request
      credentials: 'include' 
  }),
  endpoints: (builder) => ({
    // We use 'mutation' because this is a POST request that changes server state
    createPaymentIntent: builder.mutation<{ clientSecret: string }, { amount: number; currency: string }>({
      query: (body) => ({
        url: '/create-intent',
        method: 'POST',
        body,
      }),
    }),
  }),
});

// Export the hook for use in components
export const { useCreatePaymentIntentMutation } = paymentApi;