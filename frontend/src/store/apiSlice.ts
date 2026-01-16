import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * The base URL for the backend API.
 * Reads from environment variable VITE_API_URL or defaults to localhost:8080.
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Main RTK Query API slice for the application.
 * <p>
 * This slice provides the base configuration for all API endpoints including:
 * - Base URL configuration
 * - Cookie-based authentication (credentials: 'include')
 * - CSRF token handling from cookies
 * - Cache tag types for automatic cache invalidation
 * </p>
 * <p>
 * Endpoints are injected into this slice via injectEndpoints in service files.
 * </p>
 */
export const apiSlice = createApi({
  reducerPath: 'api', // The name of the slice in the Redux store
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL,
    // IMPORTANT: This ensures cookies (sessions) are sent with every request
    credentials: 'include',
    prepareHeaders: (headers) => {
      // If you were using JWT tokens, you'd attach them here.
      // Since we use Cookies, 'credentials: include' is usually handled in the hook options
      // or by default depending on the browser environment.

      // 1. Try to find the XSRF-TOKEN in the browser's cookies
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      // 2. SET THE HEADER
      // If we found the token, send it to Spring
      if (token) {
        // Decode it just in case it's URL encoded
        headers.set('X-XSRF-TOKEN', decodeURIComponent(token));
      }
      return headers;
    }, 
  }),
  // Tag Types are used for caching and invalidation
  tagTypes: ['User', 'Room', 'RoomType', 'Booking', 'Reservation'], 
  endpoints: () => ({}), // We inject endpoints in separate files
});