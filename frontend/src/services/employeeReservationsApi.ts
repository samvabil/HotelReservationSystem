import { apiSlice } from "../store/apiSlice";
import type {
  Reservation,
  PagedResponse,
  RevenueReportResponse,
  ReservationStatus,
  ReservationUpdateRequest,
} from "../types/Reservation";

export type EmployeeReservationSearchParams = {
  reservationId?: string;
  guestEmail?: string;
  roomTypeId?: string;
  status?: ReservationStatus;
  currentlyCheckedIn?: boolean;
  from?: string; // yyyy-mm-dd
  to?: string;   // yyyy-mm-dd (exclusive per backend)
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
};

export const employeeReservationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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

    getEmployeeRevenueReport: builder.query<RevenueReportResponse, { from?: string; to?: string } | void>({
      query: (params) => ({
        url: "/api/employees/reservations/reports/revenue",
        params: params ?? undefined,
      }),
      providesTags: [{ type: "Reservation", id: "EMP_REVENUE" }],
    }),
  }),
});

export const {
  useSearchEmployeeReservationsQuery,
  useUpdateEmployeeReservationMutation,
  useCancelEmployeeReservationMutation,
  useCheckInEmployeeReservationMutation,
  useCheckOutEmployeeReservationMutation,
  useGetEmployeeRevenueReportQuery,
} = employeeReservationsApi;
