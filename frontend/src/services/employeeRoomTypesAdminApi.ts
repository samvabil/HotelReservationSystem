import { apiSlice } from "../store/apiSlice";

export type AdminRoomType = {
  id: string;
  name: string;
  pricePerNight: number;

  numBeds: number;
  typeBed: string;
  numBedroom: number;

  squareFeet: number;
  capacity: number;

  hasJacuzzi: boolean;
  hasKitchen: boolean;

  levelOfPc: number;
  numPcs: number;

  consoles: string[];
  images: string[];
};

export type RoomTypeUpsertBody = Omit<AdminRoomType, "id">;

export const employeeRoomTypesAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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

    getAdminRoomTypeById: builder.query<AdminRoomType, string>({
      query: (id) => `/api/employees/admin/room-types/${id}`,
      providesTags: (_res, _err, id) => [{ type: "RoomType", id }],
    }),

    createAdminRoomType: builder.mutation<AdminRoomType, RoomTypeUpsertBody>({
      query: (body) => ({
        url: "/api/employees/admin/room-types",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RoomType", id: "LIST" }],
    }),

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

    deleteAdminRoomType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/employees/admin/room-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "RoomType", id: "LIST" }],
    }),

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

export const {
  useGetAdminRoomTypesQuery,
  useCreateAdminRoomTypeMutation,
  useUpdateAdminRoomTypeMutation,
  useDeleteAdminRoomTypeMutation,
  useUploadAdminRoomTypeImageMutation,
} = employeeRoomTypesAdminApi;
