import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

import {
  useGetAdminRoomsQuery,
  useCreateAdminRoomMutation,
  useUpdateAdminRoomMutation,
  useDeleteAdminRoomMutation,
  type RoomUpsertBody,
} from "../services/employeeRoomsAdminApi";

import { useGetAdminRoomTypesQuery } from "../services/employeeRoomTypesAdminApi";
import type { Room } from "../types/Room";

/**
 * Background style for admin pages.
 */
const bgStyle = {
  minHeight: "90vh",
  backgroundImage:
    'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url("https://20251117-ey-project2-group4-assets.s3.us-east-1.amazonaws.com/homepage/main.png")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  alignItems: "center",
};

function emptyRoomForm(roomTypes: { id: string }[]): RoomUpsertBody {
  return {
    roomNumber: "",
    roomTypeId: roomTypes[0]?.id ?? "",
    accessible: false,
    petFriendly: false,
    nonSmoking: true,
    occupied: false,
  };
}

/**
 * Admin page for managing rooms.
 * <p>
 * Allows administrators to create, edit, and delete individual rooms.
 * Each room must be assigned to a room type and can have flags for accessibility,
 * pet-friendliness, smoking status, and occupancy.
 * </p>
 * <p>
 * Requires ROLE_ADMIN permission. Non-admin employees are shown an access denied message.
 * </p>
 * <p>
 * Room deletion is blocked if the room is currently marked as occupied (enforced by backend).
 * </p>
 *
 * @returns {JSX.Element} The admin rooms management page.
 */
export default function AdminRooms() {
  const navigate = useNavigate();
  const { employee, isEmployeeAuthenticated } = useSelector((s: RootState) => s.employeeAuth);

  if (!isEmployeeAuthenticated || !employee) {
    sessionStorage.setItem("employeeRedirectPath", "/employee/admin/rooms");
    navigate("/employee/login", { replace: true });
    return null;
  }

  const isAdmin = employee.roles?.includes("ROLE_ADMIN");
  if (!isAdmin) {
    return (
      <Box sx={bgStyle}>
        <Container maxWidth="md">
          <Card sx={{ border: "1px solid #333" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" color="secondary" sx={{ mb: 1 }}>
                Admin Only
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Your account does not have permission to manage Rooms.
              </Typography>
              <Button variant="outlined" onClick={() => navigate("/employee/dashboard")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  const { data: roomTypes } = useGetAdminRoomTypesQuery();
  const { data: rooms, isLoading, error } = useGetAdminRoomsQuery();

  const [createRoom, { isLoading: creating }] = useCreateAdminRoomMutation();
  const [updateRoom, { isLoading: updating }] = useUpdateAdminRoomMutation();
  const [deleteRoom, { isLoading: deleting }] = useDeleteAdminRoomMutation();

  const rtList = roomTypes ?? [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomUpsertBody>(() => emptyRoomForm(rtList));

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteLabel, setPendingDeleteLabel] = useState<string>("");

  const title = useMemo(() => (editing ? "Edit Room" : "Create Room"), [editing]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyRoomForm(rtList));
    setOpen(true);
  };

  const openEdit = (r: Room) => {
    setEditing(r);

    // Remember: room.roomTypeId is a RoomType object in your API
    const selectedTypeId = (r.roomTypeId as any)?.id ?? "";

    setForm({
      roomNumber: r.roomNumber ?? "",
      roomTypeId: selectedTypeId,
      accessible: r.accessible,
      petFriendly: r.petFriendly,
      nonSmoking: r.nonSmoking,
      occupied: r.occupied,
    });

    setOpen(true);
  };

  const closeDialog = () => setOpen(false);

  const handleSave = async () => {
    const body: RoomUpsertBody = {
      roomNumber: form.roomNumber.trim(),
      roomTypeId: form.roomTypeId,
      accessible: !!form.accessible,
      petFriendly: !!form.petFriendly,
      nonSmoking: !!form.nonSmoking,
      occupied: !!form.occupied,
    };

    if (!body.roomNumber) {
      alert("Room number is required.");
      return;
    }
    if (!body.roomTypeId) {
      alert("Room type is required.");
      return;
    }

    if (editing) {
      await updateRoom({ id: editing.id, body }).unwrap();
    } else {
      await createRoom(body).unwrap();
    }
    setOpen(false);
  };

  const requestDelete = (room: Room) => {
  setPendingDeleteId(room.id);
  setPendingDeleteLabel(room.roomNumber);
  setConfirmOpen(true);
};

const confirmDelete = async () => {
  if (!pendingDeleteId) return;
  await deleteRoom(pendingDeleteId).unwrap();
  setConfirmOpen(false);
  setPendingDeleteId(null);
  setPendingDeleteLabel("");
};

const cancelDelete = () => {
  setConfirmOpen(false);
  setPendingDeleteId(null);
  setPendingDeleteLabel("");
};

  return (
    <Box sx={bgStyle}>
      <Container maxWidth="lg">
        <Card sx={{ border: "1px solid #333" }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography
                variant="h4"
                color="secondary"
                sx={{ textShadow: "0px 0px 12px #00e5ff" }}
              >
                Manage Rooms
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => navigate("/employee/dashboard")}>
                  Back
                </Button>
                <Button variant="contained" onClick={openCreate} disabled={rtList.length === 0}>
                  Create Room
                </Button>
              </Stack>
            </Stack>

            {rtList.length === 0 && (
              <Typography color="warning.main" sx={{ mb: 2 }}>
                Create at least one Room Type before creating Rooms.
              </Typography>
            )}

            {isLoading && <Typography>Loading...</Typography>}
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                Failed to load rooms.
              </Typography>
            )}

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Room Number</TableCell>
                  <TableCell>Room Type</TableCell>
                  <TableCell>Flags</TableCell>
                  <TableCell>Occupied</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(rooms ?? []).map((r) => {
                  const rt = r.roomTypeId as any; // it is the full object in your API
                  return (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{r.roomNumber}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography>{rt?.name ?? "Unknown"}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${rt?.pricePerNight?.toFixed?.(2) ?? "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {r.nonSmoking ? "Non-smoking" : "Smoking"} | {r.petFriendly ? "Pets ok" : "No pets"} |{" "}
                          {r.accessible ? "Accessible" : "Standard"}
                        </Typography>
                      </TableCell>

                      <TableCell>{r.occupied ? "Yes" : "No"}</TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="outlined" onClick={() => openEdit(r)}>
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => requestDelete(r)}
                            disabled={deleting}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!isLoading && (rooms ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">No rooms found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
          <DialogTitle>{title}</DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Room Number"
                value={form.roomNumber}
                onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
                fullWidth
              />

              <TextField
                select
                label="Room Type"
                value={form.roomTypeId}
                onChange={(e) => setForm((p) => ({ ...p, roomTypeId: e.target.value }))}
                fullWidth
              >
                {rtList.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.name} (${rt.pricePerNight.toFixed(2)})
                  </MenuItem>
                ))}
              </TextField>

              <Divider />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.nonSmoking}
                    onChange={(e) => setForm((p) => ({ ...p, nonSmoking: e.target.checked }))}
                  />
                }
                label="Non-smoking"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.petFriendly}
                    onChange={(e) => setForm((p) => ({ ...p, petFriendly: e.target.checked }))}
                  />
                }
                label="Pet friendly"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.accessible}
                    onChange={(e) => setForm((p) => ({ ...p, accessible: e.target.checked }))}
                  />
                }
                label="Accessible"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.occupied}
                    onChange={(e) => setForm((p) => ({ ...p, occupied: e.target.checked }))}
                  />
                }
                label="Occupied"
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeDialog} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={creating || updating}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={confirmOpen} onClose={cancelDelete} fullWidth maxWidth="xs">
            <DialogTitle>Delete Room</DialogTitle>
            <DialogContent>
                <Typography sx={{ mt: 1 }}>
                Are you sure you want to delete room <strong>{pendingDeleteLabel}</strong>?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This cannot be undone. If the room is marked occupied, the backend will block deletion.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={cancelDelete} variant="outlined">
                Cancel
                </Button>
                <Button onClick={confirmDelete} variant="contained" color="error" disabled={deleting}>
                Delete
                </Button>
            </DialogActions>
            </Dialog>

      </Container>
    </Box>
  );
}
