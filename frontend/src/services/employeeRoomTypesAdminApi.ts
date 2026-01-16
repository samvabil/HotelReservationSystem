import { apiSlice } from "../store/apiSlice";

/**
 * Represents a room type used in admin operations.
 */
export type AdminRoomType = {
  /** The unique identifier for the room type. */
  id: string;
  /** The display name of the room type. */
  name: string;
  /** The base cost per night for this room type. */
  pricePerNight: number;

  /** The number of beds in the room. */
  numBeds: number;
  /** The size or type of the beds (e.g., "King", "Queen"). */
  typeBed: string;
  /** The number of separate bedrooms within the suite. */
  numBedroom: number;

  /** The total area of the room in square feet. */
  squareFeet: number;
  /** The maximum number of guests allowed to sleep in this room. */
  capacity: number;

  /** Indicates if the room includes a private jacuzzi. */
  hasJacuzzi: boolean;
  /** Indicates if the room includes a kitchenette or full kitchen. */
  hasKitchen: boolean;

  /** The performance tier of the gaming PC provided (1, 2, or 3). */
  levelOfPc: number;
  /** The number of gaming PC setups available in the room. */
  numPcs: number;

  /** A list of gaming consoles available in the room. */
  consoles: string[];
  /** A list of URLs pointing to images of the room. */
  images: string[];
};

/**
 * Request body for creating or updating a room type (excludes the ID field).
 */
export type RoomTypeUpsertBody = Omit<AdminRoomType, "id">;

/**
 * RTK Query API endpoints for employee room type administration operations.
 */
export const employeeRoomTypesAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Retrieves all room types.
     * 
     * @returns A list of all room types
     */
    getAdminRoomTypes: builder.query<AdminRoomType[], void>({
      query: () => "/api/employees/admin/room-types",
      providesTags: (result) =>
        result
          ? [
              { type: "RoomType" as const, id: "LIST" },
              ...result.map((rt) => ({ type: "RoomType" as const, id: rt.id })),
            ]
          : [{ type: "RoomType" as const, id: "LIST" }],
    }),

    /**
     * Retrieves a specific room type by its ID.
     * 
     * @param id - The unique identifier of the room type
     * @returns The room type details
     */
    getAdminRoomTypeById: builder.query<AdminRoomType, string>({
      query: (id) => `/api/employees/admin/room-types/${id}`,
      providesTags: (_res, _err, id) => [{ type: "RoomType", id }],
    }),

    /**
     * Creates a new room type.
     * 
     * @param body - The room type details to create
     * @returns The created room type
     */
    createAdminRoomType: builder.mutation<AdminRoomType, RoomTypeUpsertBody>({
      query: (body) => ({
        url: "/api/employees/admin/room-types",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RoomType", id: "LIST" }],
    }),

    /**
     * Updates an existing room type.
     * 
     * @param id - The unique identifier of the room type to update
     * @param body - The updated room type details
     * @returns The updated room type
     */
    updateAdminRoomType: builder.mutation<AdminRoomType, { id: string; body: RoomTypeUpsertBody }>({
      query: ({ id, body }) => ({
        url: `/api/employees/admin/room-types/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "RoomType", id: "LIST" },
        { type: "RoomType", id: arg.id },
      ],
    }),

    /**
     * Deletes a room type by its ID.
     * 
     * @param id - The unique identifier of the room type to delete
     */
    deleteAdminRoomType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/employees/admin/room-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "RoomType", id: "LIST" }],
    }),

    /**
     * Uploads an image for a room type.
     * 
     * @param roomTypeId - The unique identifier of the room type
     * @param file - The image file to upload
     * @returns Upload response potentially containing the image URL
     */
    uploadAdminRoomTypeImage: builder.mutation<
      { url?: string } | any,
      { roomTypeId: string; file: File }
    >({
      query: ({ roomTypeId, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/api/employees/admin/room-types/${roomTypeId}/images`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_res, _err, arg) => [
        { type: "RoomType", id: "LIST" },
        { type: "RoomType", id: arg.roomTypeId },
      ],
    }),
  }),
});

/**
 * Exported hooks for usage in functional components.
 * 
 * - useGetAdminRoomTypesQuery: Hook to fetch all room types
 * - useGetAdminRoomTypeByIdQuery: Hook to fetch a room type by ID
 * - useCreateAdminRoomTypeMutation: Hook to create a new room type
 * - useUpdateAdminRoomTypeMutation: Hook to update a room type
 * - useDeleteAdminRoomTypeMutation: Hook to delete a room type
 * - useUploadAdminRoomTypeImageMutation: Hook to upload an image for a room type
 */
export const {
  useGetAdminRoomTypesQuery,
  useCreateAdminRoomTypeMutation,
  useUpdateAdminRoomTypeMutation,
  useDeleteAdminRoomTypeMutation,
  useUploadAdminRoomTypeImageMutation,
} = employeeRoomTypesAdminApi;
