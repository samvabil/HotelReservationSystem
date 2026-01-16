import { apiSlice } from '../store/apiSlice';
import { type User } from '../types/User';

/**
 * RTK Query API endpoints for user authentication operations.
 */
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Endpoint to get the current authenticated user session.
     * Replaces localStorage checks by querying the backend for the current user.
     */
    getCurrentUser: builder.query<User, void>({
      query: () => '/user', // Assuming you have a route that returns req.user
      providesTags: ['User'],
    }),
    
    /**
     * Endpoint to logout the current user.
     * Calls the backend to clear the authentication cookie.
     */
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      // When we logout, our 'User' cache is no longer valid
      invalidatesTags: ['User'],
    }),
  }),
});

/**
 * Exported hooks for usage in functional components.
 * 
 * - useGetCurrentUserQuery: Hook to fetch the current authenticated user
 * - useLogoutUserMutation: Hook to logout the current user
 */
export const { useGetCurrentUserQuery, useLogoutUserMutation } = authApi;