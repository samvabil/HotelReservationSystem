import { apiSlice } from '../store/apiSlice';

export const reservationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createReservation: builder.mutation({
      query: (body) => ({
        url: '/reservations', // Matches the Controller
        method: 'POST',
        body,
      }),
      // Invalidate the 'Room' tag so the calendar refreshes immediately!
      invalidatesTags: ['Room'], 
    }),
  }),
});

export const { useCreateReservationMutation } = reservationApi;