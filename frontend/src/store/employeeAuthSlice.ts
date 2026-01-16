import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EmployeeMe } from "../services/employeeAuthApi";

/**
 * State interface for employee authentication.
 */
type EmployeeAuthState = {
  /** The authenticated employee object, or null if not authenticated. */
  employee: EmployeeMe | null;
  /** Whether an employee is currently authenticated. */
  isEmployeeAuthenticated: boolean;
};

const initialState: EmployeeAuthState = {
  employee: null,
  isEmployeeAuthenticated: false,
};

/**
 * Redux slice for managing employee authentication state.
 * <p>
 * This slice manages the authenticated employee's data and authentication status.
 * The authentication state is synchronized with the API via App.tsx.
 * </p>
 */
const employeeAuthSlice = createSlice({
  name: "employeeAuth",
  initialState,
  reducers: {
    /**
     * Sets the authenticated employee and marks as authenticated.
     *
     * @param state - The current employee authentication state.
     * @param action - Payload containing the employee object.
     */
    setEmployee: (state, action: PayloadAction<EmployeeMe>) => {
      state.employee = action.payload;
      state.isEmployeeAuthenticated = true;
    },
    /**
     * Clears the authenticated employee and marks as not authenticated.
     *
     * @param state - The current employee authentication state.
     */
    clearEmployee: (state) => {
      state.employee = null;
      state.isEmployeeAuthenticated = false;
    },
  },
});

export const { setEmployee, clearEmployee } = employeeAuthSlice.actions;
export default employeeAuthSlice.reducer;
