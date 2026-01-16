import { apiSlice } from "../store/apiSlice";

/**
 * Represents the employee profile data returned from the API.
 */
export type EmployeeMe = {
  /** The unique MongoDB identifier of the employee. */
  id: string;
  /** The business employee ID assigned by the organization. */
  employeeId: string;
  /** The employee's email address. */
  email: string;
  /** The list of roles assigned to the employee. */
  roles: string[];
  /** Whether the employee account is currently active. */
  isActive: boolean;
  /** The ISO timestamp when the account was created. */
  createdAt: string;
  /** The ISO timestamp of the employee's last login, or null if never logged in. */
  lastLogin: string | null;
};

/**
 * Creates a Basic Authentication header string from email and password.
 * 
 * @param email - The employee's email address
 * @param password - The employee's password
 * @returns The Basic Auth header string
 */
function basicHeader(email: string, password: string) {
  return "Basic " + btoa(`${email}:${password}`);
}

/**
 * RTK Query API endpoints for employee authentication operations.
 */
export const employeeAuthApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Authenticates an employee and establishes a session cookie.
     * This is a one-time operation that uses Basic Auth credentials.
     */
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

    /**
     * Retrieves the currently authenticated employee's profile information.
     * After a session is established, this uses cookies only (no Basic Auth header).
     */
    getEmployeeMe: builder.query<EmployeeMe, void>({
      query: () => "/api/employees/me",
    }),

    /**
     * Logs out the current employee session by invalidating the session cookie.
     */
    logoutEmployee: builder.mutation<void, void>({
      query: () => ({
        url: "/api/employees/logout",
        method: "POST",
      }),
    }),
  }),
});

/**
 * Exported hooks for usage in functional components.
 * 
 * - useStartEmployeeSessionMutation: Hook to authenticate and start an employee session
 * - useLazyGetEmployeeMeQuery: Lazy hook to fetch employee profile on demand
 * - useGetEmployeeMeQuery: Hook to fetch employee profile (auto-fetches on mount)
 * - useLogoutEmployeeMutation: Hook to logout the current employee
 */
export const { useStartEmployeeSessionMutation, useLazyGetEmployeeMeQuery, useGetEmployeeMeQuery, useLogoutEmployeeMutation } = employeeAuthApi;
