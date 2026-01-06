import { configureStore } from '@reduxjs/toolkit';
import userAuthReducer from './userAuthSlice';
import { apiSlice } from './apiSlice';
import bookingReducer from './bookingSlice';
import { paymentApi } from '../services/paymentApi';

export const store = configureStore({
  reducer: {
    // STATE
    userAuth: userAuthReducer,
    booking: bookingReducer,
    //API
    [apiSlice.reducerPath]: apiSlice.reducer
    // Add other slices here later (e.g., bookingSlice)
  },
  // Adding the api middleware enables caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(paymentApi.middleware)
  ,
});

// Infer types for useDispatch and useSelector
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;