import { apiSlice } from "../store/apiSlice";

export type EmployeeMe = {
  id: string;
  employeeId: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
};

function basicHeader(email: string, password: string) {
  return "Basic " + btoa(`${email}:${password}`);
}

export const employeeAuthApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1) One-time: authenticate + establish session cookie
    startEmployeeSession: builder.mutation<void, { email: string; password: string }>({
    query: ({ email, password }) => ({
        url: "/api/employees/session",
        method: "POST",
        headers: {
        Authorization: basicHeader(email.trim(), password),
        },
        credentials: "include",
    }),
    }),

    // 2) After session exists, use cookies only
    getEmployeeMe: builder.query<EmployeeMe, void>({
      query: () => "/api/employees/me",
    }),

    // 3) logout employee session
    logoutEmployee: builder.mutation<void, void>({
      query: () => ({
        url: "/api/employees/logout",
        method: "POST",
      }),
    }),
  }),
});

export const { useStartEmployeeSessionMutation, useLazyGetEmployeeMeQuery, useLogoutEmployeeMutation } = employeeAuthApi;
