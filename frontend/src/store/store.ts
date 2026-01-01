import { configureStore } from '@reduxjs/toolkit';
import userAuthReducer from './userAuthSlice';
import { apiSlice } from './apiSlice';

export const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
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