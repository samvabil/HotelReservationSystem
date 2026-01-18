import { apiSlice } from "../store/apiSlice";
import type {
  Reservation,
  PagedResponse,
  RevenueReportResponse,
  ReservationStatus,
  ReservationUpdateRequest,
} from "../types/Reservation";

/**
 * Search parameters for employee reservation searches.
 */
export type EmployeeReservationSearchParams = {
  /** Filter by reservation ID. */
  reservationId?: string;
  /** Filter by guest email address. */
  guestEmail?: string;
  /** Filter by room type ID. */
  roomTypeId?: string;
  /** Filter by reservation status. */
  status?: ReservationStatus;
  /** Filter by whether guests are currently checked in. */
  currentlyCheckedIn?: boolean;
  /** Start date for date range filtering (yyyy-mm-dd). */
  from?: string; // yyyy-mm-dd
  /** End date for date range filtering (yyyy-mm-dd, exclusive per backend). */
  to?: string;   // yyyy-mm-dd (exclusive per backend)
  /** Page number for pagination (0-indexed). */
  page?: number;
  /** Number of items per page. */
  size?: number;
  /** Field name to sort by. */
  sortBy?: string;
  /** Sort direction (ASC or DESC). */
  sortDir?: "ASC" | "DESC";
};

/**
 * RTK Query API endpoints for employee reservation management operations.
 */
export const employeeReservationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Searches for reservations with optional filter criteria and pagination.
     * 
     * @param params - Search parameters for filtering and pagination
     * @returns A paginated response containing matching reservations
     */
    searchEmployeeReservations: builder.query<PagedResponse<Reservation>, EmployeeReservationSearchParams | void>({
      query: (params) => ({
        url: "/api/employees/reservations",
        params: params ?? undefined,
      }),
      providesTags: (res) =>
        res
          ? [
              { type: "Reservation" as const, id: "EMP_LIST" },
              ...res.items.map((r) => ({ type: "Reservation" as const, id: r.id })),
            ]
          : [{ type: "Reservation" as const, id: "EMP_LIST" }],
    }),

    /**
     * Updates an existing reservation (employee override mode).
     * 
     * @param id - The unique identifier of the reservation to update
     * @param body - The updated reservation details
     * @returns The updated reservation
     */
    updateEmployeeReservation: builder.mutation<Reservation, { id: string; body: ReservationUpdateRequest }>({
      query: ({ id, body }) => ({
        url: `/api/employees/reservations/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Reservation", id: "EMP_LIST" },
        { type: "Reservation", id: arg.id },
        { type: "Room", id: "LIST" },
      ],
    }),

    /**
     * Cancels a reservation by its ID (employee override).
     * 
     * @param id - The unique identifier of the reservation to cancel
     */
    cancelEmployeeReservation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/employees/reservations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Reservation", id: "EMP_LIST" },
        { type: "Reservation", id },
        { type: "Room", id: "LIST" },
      ],
    }),

    /**
     * Checks in a guest for a reservation.
     * 
     * @param id - The unique identifier of the reservation
     * @returns The updated reservation with checked-in status
     */
    checkInEmployeeReservation: builder.mutation<Reservation, string>({
      query: (id) => ({
        url: `/api/employees/reservations/${id}/check-in`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Reservation", id: "EMP_LIST" },
        { type: "Reservation", id },
        { type: "Room", id: "LIST" },
      ],
    }),

    /**
     * Checks out a guest from a reservation.
     * 
     * @param id - The unique identifier of the reservation
     * @returns The updated reservation
     */
    checkOutEmployeeReservation: builder.mutation<Reservation, string>({
      query: (id) => ({
        url: `/api/employees/reservations/${id}/check-out`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Reservation", id: "EMP_LIST" },
        { type: "Reservation", id },
        { type: "Room", id: "LIST" },
      ],
    }),

    /**
     * Retrieves a revenue report for a specified date range.
     * 
     * @param params - Optional date range parameters for the report
     * @returns Revenue report with total and monthly breakdowns
     */
    getEmployeeRevenueReport: builder.query<RevenueReportResponse, { from?: string; to?: string } | void>({
      query: (params) => ({
        url: "/api/employees/reservations/reports/revenue",
        params: params ?? undefined,
      }),
      providesTags: [{ type: "Reservation", id: "EMP_REVENUE" }],
    }),
  }),
});

/**
 * Exported hooks for usage in functional components.
 * 
 * - useSearchEmployeeReservationsQuery: Hook to search reservations with filters
 * - useUpdateEmployeeReservationMutation: Hook to update a reservation
 * - useCancelEmployeeReservationMutation: Hook to cancel a reservation
 * - useCheckInEmployeeReservationMutation: Hook to check in a guest
 * - useCheckOutEmployeeReservationMutation: Hook to check out a guest
 * - useGetEmployeeRevenueReportQuery: Hook to fetch revenue reports
 */
export const {
  useSearchEmployeeReservationsQuery,
  useUpdateEmployeeReservationMutation,
  useCancelEmployeeReservationMutation,
  useCheckInEmployeeReservationMutation,
  useCheckOutEmployeeReservationMutation,
  useGetEmployeeRevenueReportQuery,
} = employeeReservationsApi;
