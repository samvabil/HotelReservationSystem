import { apiSlice } from "../store/apiSlice";
import type { Room } from "../types/Room";

export type RoomUpsertBody = {
  roomNumber: string;
  roomTypeId: string; // backend expects string id on create/update
  accessible?: boolean;
  petFriendly?: boolean;
  nonSmoking?: boolean;
  occupied?: boolean;
};

export const employeeRoomsAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminRooms: builder.query<Room[], { roomTypeId?: string } | void>({
      query: (arg) => {
        if (!arg || !arg.roomTypeId) return "/api/employees/admin/rooms";
        return { url: "/api/employees/admin/rooms", params: { roomTypeId: arg.roomTypeId } };
      },
      providesTags: (result) =>
        result
          ? [
              { type: "Room" as const, id: "LIST" },
              ...result.map((r) => ({ type: "Room" as const, id: r.id })),
            ]
          : [{ type: "Room" as const, id: "LIST" }],
    }),

    createAdminRoom: builder.mutation<Room, RoomUpsertBody>({
      query: (body) => ({
        url: "/api/employees/admin/rooms",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),

    updateAdminRoom: builder.mutation<Room, { id: string; body: RoomUpsertBody }>({
      query: ({ id, body }) => ({
        url: `/api/employees/admin/rooms/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Room", id: "LIST" },
        { type: "Room", id: arg.id },
      ],
    }),

    deleteAdminRoom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/employees/admin/rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAdminRoomsQuery,
  useCreateAdminRoomMutation,
  useUpdateAdminRoomMutation,
  useDeleteAdminRoomMutation,
} = employeeRoomsAdminApi;
