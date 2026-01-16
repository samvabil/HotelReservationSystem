import { configureStore } from '@reduxjs/toolkit';
import userAuthReducer from './userAuthSlice';
import employeeAuthReducer from "./employeeAuthSlice";
import { apiSlice } from './apiSlice';
import bookingReducer from './bookingSlice';

/**
 * The Redux store configuration for the application.
 * <p>
 * This store combines multiple reducers:
 * - userAuth: Manages guest user authentication state
 * - employeeAuth: Manages employee authentication state
 * - booking: Manages booking search criteria and selected room
 * - api: RTK Query API slice for data fetching and caching
 * </p>
 * <p>
 * The store includes RTK Query middleware for automatic caching, invalidation, and polling.
 * </p>
 */
export const store = configureStore({
  reducer: {
    // STATE
    userAuth: userAuthReducer,
    employeeAuth: employeeAuthReducer,
    booking: bookingReducer,
    //API
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  // Adding the api middleware enables caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  
});

/**
 * Type representing the root state of the Redux store.
 * Used for typed useSelector hooks.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Type representing the dispatch function for the Redux store.
 * Used for typed useDispatch hooks.
 */
export type AppDispatch = typeof store.dispatch;