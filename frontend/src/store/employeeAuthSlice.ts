import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EmployeeMe } from "../services/employeeAuthApi";

type EmployeeAuthState = {
  employee: EmployeeMe | null;
  isEmployeeAuthenticated: boolean;
};

const initialState: EmployeeAuthState = {
  employee: null,
  isEmployeeAuthenticated: false,
};

const employeeAuthSlice = createSlice({
  name: "employeeAuth",
  initialState,
  reducers: {
    setEmployee: (state, action: PayloadAction<EmployeeMe>) => {
      state.employee = action.payload;
      state.isEmployeeAuthenticated = true;
    },
    clearEmployee: (state) => {
      state.employee = null;
      state.isEmployeeAuthenticated = false;
    },
  },
});

export const { setEmployee, clearEmployee } = employeeAuthSlice.actions;
export default employeeAuthSlice.reducer;
