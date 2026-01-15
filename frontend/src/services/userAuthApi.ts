import { apiSlice } from '../store/apiSlice';
import { type User } from '../types/User';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint to get the current user session (replaces localStorage check)
    getCurrentUser: builder.query<User, void>({
      query: () => '/user', // Assuming you have a route that returns req.user
      providesTags: ['User'],
    }),
    
    // Endpoint to logout (calls backend to clear cookie)
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

// Export hooks for usage in functional components
export const { useGetCurrentUserQuery, useLogoutUserMutation } = authApi;