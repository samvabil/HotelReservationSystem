import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/User';

/**
 * State interface for user authentication.
 */
interface AuthState {
  /** The authenticated user object, or null if not authenticated. */
  user: User | null;
  /** Whether the user is currently authenticated. */
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null, // We trust the API check in LoginSuccess, not localStorage for now
  isAuthenticated: false,
};

/**
 * Redux slice for managing guest user authentication state.
 * <p>
 * This slice manages the authenticated user's data and authentication status.
 * The authentication state is synchronized with the API via App.tsx.
 * </p>
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Sets the authenticated user and marks the user as authenticated.
     *
     * @param state - The current authentication state.
     * @param action - Payload containing the user object.
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    /**
     * Clears the authenticated user and marks as not authenticated.
     *
     * @param state - The current authentication state.
     */
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;