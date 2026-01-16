import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Room filter criteria for search functionality.
 * All filter fields are nullable to allow "no preference" selections.
 */
export interface RoomFilters {
  /** Filter by room type name (optional). */
  roomType: string | null;    
  /** Minimum price per night (optional). */
  minPrice: number | null;
  /** Maximum price per night (optional). */
  maxPrice: number | null;
  
  /** Whether room must be accessible (optional). */
  accessible: boolean | null;
  /** Whether room must allow pets (optional). */
  petFriendly: boolean | null;
  /** Whether room must be non-smoking (optional). */
  nonSmoking: boolean | null;
  /** Whether room must have a jacuzzi (optional). */
  hasJacuzzi: boolean | null;

  /** Minimum number of beds required (optional). */
  minBeds: number | null;      
  /** Minimum number of bedrooms required (optional). */
  minBedrooms: number | null;
}

/**
 * Gaming equipment preferences for room search.
 */
export interface GamingPreferences {
  /** Required number of gaming PCs (optional). */
  pcCount: number | null;      
  /** Required PC performance tier (optional). */
  pcTier: string | null;       
  /** Required list of gaming consoles (optional). */
  consoles: string[];          
}

/**
 * Complete booking state for room search and reservation flow.
 * This state is persisted to localStorage to maintain search criteria across page refreshes.
 */
export interface BookingState {
  /** The desired check-in date (ISO format string, optional). */
  checkInDate: string | null;
  /** The desired check-out date (ISO format string, optional). */
  checkOutDate: string | null;
  /** The number of guests (defaults to 2). */
  guestCount: number; 

  /** Room filter criteria. */
  filters: RoomFilters;
  /** Gaming equipment preferences. */
  gamingPreferences: GamingPreferences;
  /** The unique identifier of the selected room (optional). */
  selectedRoomId: string | null;

  /** The unique identifier of the reservation being modified (optional). */
  modificationReservationId: string | null;
}

const initialState: BookingState = {
  checkInDate: null,
  checkOutDate: null,
  guestCount: 2, 

  modificationReservationId: null,
  
  filters: {
    roomType: null,
    minPrice: null,
    maxPrice: null,

    // 2. Default to null (No preference selected yet)
    accessible: null,
    petFriendly: null,
    nonSmoking: null,
    hasJacuzzi: null,

    minBeds: null,     
    minBedrooms: null,
  },
  
  gamingPreferences: {
    pcCount: null,  
    pcTier: null,
    consoles: [],
  },

  selectedRoomId: null,
};

/**
 * Loads booking state from localStorage.
 * Returns initial state if no saved state exists or if parsing fails.
 *
 * @returns The loaded booking state or initial state if loading fails.
 */
const loadState = (): BookingState => {
  try {
    const serializedState = localStorage.getItem('bookingState');
    if (serializedState === null) return initialState;
    return JSON.parse(serializedState);
  } catch (err) {
    return initialState;
  }
};

/**
 * Redux slice for managing booking search state.
 * <p>
 * This slice manages room search criteria, filters, gaming preferences, and selected room.
 * All state changes are automatically persisted to localStorage for persistence across sessions.
 * </p>
 */
const bookingSlice = createSlice({
  name: 'booking',
  initialState: loadState(),
  reducers: {
    /**
     * Sets the check-in date, check-out date, and guest count simultaneously.
     *
     * @param state - The current booking state.
     * @param action - Payload containing checkIn, checkOut, and guests.
     */
    setDatesAndGuests: (state, action: PayloadAction<{ checkIn: string, checkOut: string, guests: number }>) => {
      state.checkInDate = action.payload.checkIn;
      state.checkOutDate = action.payload.checkOut;
      state.guestCount = action.payload.guests;
      localStorage.setItem('bookingState', JSON.stringify(state));
    },

    /**
     * Updates the guest count.
     *
     * @param state - The current booking state.
     * @param action - Payload containing the new guest count.
     */
    setGuestCount: (state, action: PayloadAction<number>) => {
      state.guestCount = action.payload;
      localStorage.setItem('bookingState', JSON.stringify(state));
    },

    /**
     * Updates room filters (handles partial updates automatically).
     *
     * @param state - The current booking state.
     * @param action - Payload containing partial filter updates.
     */
    setFilters: (state, action: PayloadAction<Partial<RoomFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      localStorage.setItem('bookingState', JSON.stringify(state));
    },

    /**
     * Updates gaming preferences (handles partial updates automatically).
     *
     * @param state - The current booking state.
     * @param action - Payload containing partial gaming preference updates.
     */
    setGamingPreferences: (state, action: PayloadAction<Partial<GamingPreferences>>) => {
      state.gamingPreferences = { ...state.gamingPreferences, ...action.payload };
      localStorage.setItem('bookingState', JSON.stringify(state));
    },
    
    /**
     * Sets the selected room ID.
     *
     * @param state - The current booking state.
     * @param action - Payload containing the selected room ID.
     */
    selectRoom: (state, action: PayloadAction<string>) => {
      state.selectedRoomId = action.payload;
      localStorage.setItem('bookingState', JSON.stringify(state));
    },

    /**
     * Marks that a reservation is being modified.
     *
     * @param state - The current booking state.
     * @param action - Payload containing the reservation ID being modified.
     */
    startModification: (state, action: PayloadAction<string>) => {
      state.modificationReservationId = action.payload;
      localStorage.setItem('bookingState', JSON.stringify(state));
    },

    /**
     * Clears all booking state and removes it from localStorage.
     *
     * @param state - The current booking state (not used).
     * @returns The initial booking state.
     */
    clearBookingState: ( ) => {
      localStorage.removeItem('bookingState');
      return initialState;
    }
  },
});

export const { 
  setDatesAndGuests,
  setGuestCount,
  setFilters, 
  setGamingPreferences, 
  selectRoom,
  startModification,
  clearBookingState 
} = bookingSlice.actions;

export default bookingSlice.reducer;