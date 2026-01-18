import { apiSlice } from "../store/apiSlice";
import type { Room } from "../types/Room";

/**
 * Request body for creating or updating a room.
 */
export type RoomUpsertBody = {
  /** The physical room number or identifier. */
  roomNumber: string;
  /** The unique identifier of the room type (backend expects string id on create/update). */
  roomTypeId: string; // backend expects string id on create/update
  /** Whether the room is accessible (ADA compliant). */
  accessible?: boolean;
  /** Whether pets are allowed in the room. */
  petFriendly?: boolean;
  /** Whether the room is non-smoking. */
  nonSmoking?: boolean;
  /** Whether the room is currently occupied. */
  occupied?: boolean;
};

/**
 * RTK Query API endpoints for employee room administration operations.
 */
export const employeeRoomsAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Retrieves all rooms, optionally filtered by room type.
     * 
     * @param arg - Optional filter by room type ID
     * @returns A list of rooms
     */
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

    /**
     * Creates a new room.
     * 
     * @param body - The room details to create
     * @returns The created room
     */
    createAdminRoom: builder.mutation<Room, RoomUpsertBody>({
      query: (body) => ({
        url: "/api/employees/admin/rooms",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),

    /**
     * Updates an existing room.
     * 
     * @param id - The unique identifier of the room to update
     * @param body - The updated room details
     * @returns The updated room
     */
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

    /**
     * Deletes a room by its ID.
     * 
     * @param id - The unique identifier of the room to delete
     */
    deleteAdminRoom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/employees/admin/rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),
  }),
});

/**
 * Exported hooks for usage in functional components.
 * 
 * - useGetAdminRoomsQuery: Hook to fetch all rooms (optionally filtered by type)
 * - useCreateAdminRoomMutation: Hook to create a new room
 * - useUpdateAdminRoomMutation: Hook to update a room
 * - useDeleteAdminRoomMutation: Hook to delete a room
 */
export const {
  useGetAdminRoomsQuery,
  useCreateAdminRoomMutation,
  useUpdateAdminRoomMutation,
  useDeleteAdminRoomMutation,
} = employeeRoomsAdminApi;
