import { apiSlice } from "../store/apiSlice";
import { type RoomTypeSearchResult } from "../types/RoomTypeSearchResult";
import { type BookingState } from "../store/bookingSlice";

export const roomApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // The Endpoint Definition
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
    }),

    // Future endpoints can go here (e.g., getRoomById)

  }),
  overrideExisting: false, // Prevents errors during hot-reloading
});

// Export the auto-generated hook
export const { useSearchRoomsQuery } = roomApi;