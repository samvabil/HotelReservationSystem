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
      invalidatesTags: ['Reservation', 'Room'], 
    }),
    // 1. Get My Reservations
    getMyReservations: builder.query({
      query: () => '/reservations/my-reservations',
      providesTags: ['Reservation'],
    }),

    // 2. Cancel
    cancelReservation: builder.mutation({
      query: (id) => ({
        url: `/reservations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reservation', 'Room'], // Refreshes the list immediately
    }),

    // 3. Update
    updateReservation: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/reservations/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Reservation', 'Room'],
    }),
  }),
});

export const { 
    useCreateReservationMutation,
    useGetMyReservationsQuery, 
    useCancelReservationMutation,
    useUpdateReservationMutation
} = reservationApi;