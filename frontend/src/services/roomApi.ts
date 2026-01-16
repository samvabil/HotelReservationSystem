import { apiSlice } from "../store/apiSlice";
import { type RoomTypeSearchResult } from "../types/RoomTypeSearchResult";
import { type BookingState } from "../store/bookingSlice";
import type { Room } from "../types/Room";

/**
 * RTK Query API endpoints for room-related operations.
 */
export const roomApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Searches for available rooms matching the specified criteria.
     * 
     * @param criteria - The search criteria including dates, filters, and gaming preferences
     * @returns A list of room type search results with available rooms
     */
    searchRooms: builder.query<RoomTypeSearchResult[], BookingState>({
      query: (criteria) => {
        const params = new URLSearchParams();

        // 1. Core Dates
        if (criteria.checkInDate) params.append('checkIn', criteria.checkInDate.split('T')[0]);
        if (criteria.checkOutDate) params.append('checkOut', criteria.checkOutDate.split('T')[0]);
        if (criteria.guestCount) params.append('guests', criteria.guestCount.toString());
        
        // 2. Filters
        const { filters, gamingPreferences } = criteria;
        
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.roomType) params.append('roomType', filters.roomType);

        if (filters.minBeds) params.append('minBeds', filters.minBeds.toString());
        if (filters.minBedrooms) params.append('minBedrooms', filters.minBedrooms.toString());
        
        if (filters.accessible) params.append('accessible', 'true');
        if (filters.petFriendly) params.append('petFriendly', 'true');
        if (filters.nonSmoking) params.append('nonSmoking', 'true');
        if (filters.hasJacuzzi) params.append('hasJacuzzi', 'true');

        // 3. Gaming
        if (gamingPreferences.pcCount) params.append('pcCount', gamingPreferences.pcCount.toString());
        if (gamingPreferences.pcTier) params.append('pcTier', gamingPreferences.pcTier);
        if (gamingPreferences.consoles && gamingPreferences.consoles.length > 0) {
             gamingPreferences.consoles.forEach(c => params.append('consoles', c));
        }

        return {
          url: '/rooms/search',
          params: params,
        };
      },
      // This allows us to invalidate this cache later if we add a booking
      providesTags: ['Room'], 
    }
  ),

    /**
     * Retrieves a specific room by its unique identifier.
     * 
     * @param id - The unique identifier of the room
     * @returns The room details including room type information
     */
    getRoomById: builder.query<Room, string>({
      // 1. The URL matches your Controller (@GetMapping("/{id}"))
      query: (id) => `/rooms/${id}`,
      
      // 2. (Optional) Cache settings - keep the data fresh
      providesTags: (_result, _error, id) => [{ type: 'Room', id }],
    }
  ),
  }),
  overrideExisting: false, // Prevents errors during hot-reloading
});

/**
 * Exported hooks for usage in functional components.
 * 
 * - useSearchRoomsQuery: Hook to search for available rooms
 * - useGetRoomByIdQuery: Hook to fetch a room by ID
 */
export const { useSearchRoomsQuery, useGetRoomByIdQuery } = roomApi;