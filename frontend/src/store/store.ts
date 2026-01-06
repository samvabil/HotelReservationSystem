import { configureStore } from '@reduxjs/toolkit';
import userAuthReducer from './userAuthSlice';
import employeeAuthReducer from "./employeeAuthSlice";
import { apiSlice } from './apiSlice';
import bookingReducer from './bookingSlice';

export const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
    employeeAuth: employeeAuthReducer,
    booking: bookingReducer,
    [apiSlice.reducerPath]: apiSlice.reducer
    // Add other slices here later (e.g., bookingSlice)
  },
  // Adding the api middleware enables caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Infer types for useDispatch and useSelector
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;