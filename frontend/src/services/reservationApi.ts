import { apiSlice } from '../store/apiSlice';

/**
 * RTK Query API endpoints for reservation operations.
 */
export const reservationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Creates a new reservation for the authenticated user.
     */
    createReservation: builder.mutation({
      query: (body) => ({
        url: '/api/reservations', // Matches the Controller
        method: 'POST',
        body,
      }),
      // Invalidate the 'Room' tag so the calendar refreshes immediately!
      invalidatesTags: ['Reservation', 'Room'], 
    }),
    /**
     * Retrieves all reservations for the currently authenticated user.
     */
    getMyReservations: builder.query({
      query: () => '/api/reservations/my-reservations',
      providesTags: ['Reservation'],
    }),

    /**
     * Cancels a reservation by its ID.
     */
    cancelReservation: builder.mutation({
      query: (id) => ({
        url: `/api/reservations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reservation', 'Room'], // Refreshes the list immediately
    }),

    /**
     * Updates an existing reservation with new details.
     */
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

/**
 * Exported hooks for usage in functional components.
 * 
 * - useCreateReservationMutation: Hook to create a new reservation
 * - useGetMyReservationsQuery: Hook to fetch user's reservations
 * - useCancelReservationMutation: Hook to cancel a reservation
 * - useUpdateReservationMutation: Hook to update a reservation
 */
export const { 
    useCreateReservationMutation,
    useGetMyReservationsQuery, 
    useCancelReservationMutation,
    useUpdateReservationMutation
} = reservationApi;