import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1. Explicitly define the "Must Haves"
export interface RoomFilters {
  roomType: string | null;    
  minPrice: number | null;
  maxPrice: number | null;
  
  accessible: boolean | null;
  petFriendly: boolean | null;
  nonSmoking: boolean | null;
  hasJacuzzi: boolean | null;

  minBeds: number | null;      
  minBedrooms: number | null;
}

export interface GamingPreferences {
  pcCount: number | null;      
  pcTier: string | null;       
  consoles: string[];          
}

export interface BookingState {
  checkInDate: string | null;
  checkOutDate: string | null;
  guestCount: number; 

  filters: RoomFilters;
  gamingPreferences: GamingPreferences;
  selectedRoomId: string | null;
}

const initialState: BookingState = {
  checkInDate: null,
  checkOutDate: null,
  guestCount: 2, 
  
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

// Helper to load from LocalStorage
const loadState = (): BookingState => {
  try {
    const serializedState = localStorage.getItem('bookingState');
    if (serializedState === null) return initialState;
    return JSON.parse(serializedState);
  } catch (err) {
    return initialState;
  }
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState: loadState(),
  reducers: {
    setDatesAndGuests: (state, action: PayloadAction<{ checkIn: string, checkOut: string, guests: number }>) => {
      state.checkInDate = action.payload.checkIn;
      state.checkOutDate = action.payload.checkOut;
      state.guestCount = action.payload.guests;
      localStorage.setItem('bookingState', JSON.stringify(state));
    },

    // This Reducer handles ANY filter update automatically
    setFilters: (state, action: PayloadAction<Partial<RoomFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      localStorage.setItem('bookingState', JSON.stringify(state));
    },

    setGamingPreferences: (state, action: PayloadAction<Partial<GamingPreferences>>) => {
      state.gamingPreferences = { ...state.gamingPreferences, ...action.payload };
      localStorage.setItem('bookingState', JSON.stringify(state));
    },
    
    selectRoom: (state, action: PayloadAction<string>) => {
      state.selectedRoomId = action.payload;
      localStorage.setItem('bookingState', JSON.stringify(state));
    },

    clearBookingState: (state) => {
      localStorage.removeItem('bookingState');
      return initialState;
    }
  },
});

export const { 
  setDatesAndGuests, 
  setFilters, 
  setGamingPreferences, 
  selectRoom, 
  clearBookingState 
} = bookingSlice.actions;

export default bookingSlice.reducer;