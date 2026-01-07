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
  Divider,
  Chip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import {
  useCreateAdminRoomTypeMutation,
  useDeleteAdminRoomTypeMutation,
  useGetAdminRoomTypesQuery,
  useUpdateAdminRoomTypeMutation,
  type AdminRoomType,
  type RoomTypeUpsertBody,
} from "../services/employeeRoomTypesAdminApi";

const bgStyle = {
  minHeight: "90vh",
  backgroundImage:
    'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url("https://20251117-ey-project2-group4-assets.s3.us-east-1.amazonaws.com/homepage/main.png")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  alignItems: "center",
};

function emptyForm(): RoomTypeUpsertBody {
  return {
    name: "",
    pricePerNight: 0,

    numBeds: 1,
    typeBed: "",
    numBedroom: 1,

    squareFeet: 0,
    capacity: 1,

    hasJacuzzi: false,
    hasKitchen: false,

    levelOfPc: 1,
    numPcs: 0,

    consoles: [],
    images: [],
  };
}

export default function AdminRoomTypes() {
  const navigate = useNavigate();
  const { employee, isEmployeeAuthenticated } = useSelector((s: RootState) => s.employeeAuth);

  // Guard: employee
  if (!isEmployeeAuthenticated || !employee) {
    sessionStorage.setItem("employeeRedirectPath", "/employee/admin/room-types");
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
                Your account does not have permission to manage Room Types.
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

  const { data, isLoading, error } = useGetAdminRoomTypesQuery();
  const [createRoomType, { isLoading: creating }] = useCreateAdminRoomTypeMutation();
  const [updateRoomType, { isLoading: updating }] = useUpdateAdminRoomTypeMutation();
  const [deleteRoomType, { isLoading: deleting }] = useDeleteAdminRoomTypeMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRoomType | null>(null);
  const [form, setForm] = useState<RoomTypeUpsertBody>(() => emptyForm());
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const [consoleDraft, setConsoleDraft] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminRoomType | null>(null);

  const title = useMemo(() => (editing ? "Edit Room Type" : "Create Room Type"), [editing]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setImageUrlDraft("");
    setConsoleDraft("");
    setOpen(true);
  };

  const openEdit = (rt: AdminRoomType) => {
    setEditing(rt);
    setForm({
      name: rt.name,
      pricePerNight: rt.pricePerNight,
      numBeds: rt.numBeds,
      typeBed: rt.typeBed,
      numBedroom: rt.numBedroom,
      squareFeet: rt.squareFeet,
      capacity: rt.capacity,
      hasJacuzzi: rt.hasJacuzzi,
      hasKitchen: rt.hasKitchen,
      levelOfPc: rt.levelOfPc,
      numPcs: rt.numPcs,
      consoles: rt.consoles ?? [],
      images: rt.images ?? [],
    });
    setImageUrlDraft("");
    setConsoleDraft("");
    setOpen(true);
  };

  const closeDialog = () => setOpen(false);

  const setNum = (key: keyof RoomTypeUpsertBody, val: string) => {
    const n = Number(val);
    setForm((p) => ({ ...p, [key]: Number.isFinite(n) ? n : 0 } as RoomTypeUpsertBody));
  };

  const handleSave = async () => {
    const body: RoomTypeUpsertBody = {
      ...form,
      consoles: (form.consoles ?? []).filter(Boolean),
      images: (form.images ?? []).filter(Boolean),
    };

    if (editing) {
      await updateRoomType({ id: editing.id, body }).unwrap();
    } else {
      await createRoomType(body).unwrap();
    }
    setOpen(false);
  };

  const requestDelete = (rt: AdminRoomType) => {
  setPendingDelete(rt);
  setConfirmOpen(true);
 };

 const confirmDelete = async () => {
   if (!pendingDelete) return;
   await deleteRoomType(pendingDelete.id).unwrap();
   setConfirmOpen(false);
   setPendingDelete(null);
 };

 const cancelDelete = () => {
   setConfirmOpen(false);
   setPendingDelete(null);
 };

  const addImageUrl = () => {
    const v = imageUrlDraft.trim();
    if (!v) return;
    setForm((p) => ({ ...p, images: [...(p.images ?? []), v] }));
    setImageUrlDraft("");
  };

  const removeImageUrl = (idx: number) => {
    setForm((p) => ({ ...p, images: (p.images ?? []).filter((_, i) => i !== idx) }));
  };

  const addConsole = () => {
    const v = consoleDraft.trim();
    if (!v) return;
    setForm((p) => ({ ...p, consoles: [...(p.consoles ?? []), v] }));
    setConsoleDraft("");
  };

  const removeConsole = (idx: number) => {
    setForm((p) => ({ ...p, consoles: (p.consoles ?? []).filter((_, i) => i !== idx) }));
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
                Manage Room Types
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => navigate("/employee/dashboard")}>
                  Back
                </Button>
                <Button variant="contained" onClick={openCreate}>
                  Create Room Type
                </Button>
              </Stack>
            </Stack>

            {isLoading && <Typography>Loading...</Typography>}
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                Failed to load room types.
              </Typography>
            )}

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>PC Tier</TableCell>
                  <TableCell>Images</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(data ?? []).map((rt) => (
                  <TableRow key={rt.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{rt.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {rt.numBeds} bed, {rt.typeBed}, {rt.numBedroom} bedroom
                      </Typography>
                    </TableCell>

                    <TableCell>${rt.pricePerNight.toFixed(2)}</TableCell>
                    <TableCell>{rt.capacity}</TableCell>
                    <TableCell>{rt.levelOfPc}</TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {(rt.images ?? []).length} url(s)
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" variant="outlined" onClick={() => openEdit(rt)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => requestDelete(rt)}
                          disabled={deleting}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {!isLoading && (data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary">No room types found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="md">
          <DialogTitle>{title}</DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                fullWidth
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Price Per Night"
                  type="number"
                  value={form.pricePerNight}
                  onChange={(e) => setNum("pricePerNight", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Capacity"
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setNum("capacity", e.target.value)}
                  fullWidth
                />
              </Stack>

              <Divider />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Beds"
                  type="number"
                  value={form.numBeds}
                  onChange={(e) => setNum("numBeds", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Bed Type"
                  value={form.typeBed}
                  onChange={(e) => setForm((p) => ({ ...p, typeBed: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Bedrooms"
                  type="number"
                  value={form.numBedroom}
                  onChange={(e) => setNum("numBedroom", e.target.value)}
                  fullWidth
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Square Feet"
                  type="number"
                  value={form.squareFeet}
                  onChange={(e) => setNum("squareFeet", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="PC Tier (1-3)"
                  type="number"
                  value={form.levelOfPc}
                  onChange={(e) => setNum("levelOfPc", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="PC Count"
                  type="number"
                  value={form.numPcs}
                  onChange={(e) => setNum("numPcs", e.target.value)}
                  fullWidth
                />
              </Stack>

              <Divider />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControlLabel
                    control={
                    <Checkbox
                        checked={!!form.hasJacuzzi}
                        onChange={(e) => setForm((p) => ({ ...p, hasJacuzzi: e.target.checked }))}
                    />
                    }
                    label="Has Jacuzzi"
                />
                <FormControlLabel
                    control={
                    <Checkbox
                        checked={!!form.hasKitchen}
                        onChange={(e) => setForm((p) => ({ ...p, hasKitchen: e.target.checked }))}
                    />
                    }
                    label="Has Kitchen"
                />
                </Stack>

              <Divider />

              <Typography variant="subtitle1" fontWeight={700}>
                Consoles
              </Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
                <TextField
                  label="Add Console (example: PS5)"
                  value={consoleDraft}
                  onChange={(e) => setConsoleDraft(e.target.value)}
                  fullWidth
                />
                <Button variant="outlined" onClick={addConsole}>
                  Add
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(form.consoles ?? []).map((c, idx) => (
                  <Chip key={`${c}-${idx}`} label={c} onDelete={() => removeConsole(idx)} />
                ))}
              </Stack>

              <Divider />

              <Typography variant="subtitle1" fontWeight={700}>
                Image URLs (S3)
              </Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
                <TextField
                  label="Add Image URL"
                  value={imageUrlDraft}
                  onChange={(e) => setImageUrlDraft(e.target.value)}
                  fullWidth
                />
                <Button variant="outlined" onClick={addImageUrl}>
                  Add
                </Button>
              </Stack>

              <Stack spacing={1}>
                {(form.images ?? []).map((url, idx) => (
                  <Box
                    key={`${url}-${idx}`}
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      border: "1px solid #333",
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ wordBreak: "break-all", flexGrow: 1 }}>
                      {url}
                    </Typography>
                    <Button size="small" color="error" variant="outlined" onClick={() => removeImageUrl(idx)}>
                      Remove
                    </Button>
                  </Box>
                ))}

                {(form.images ?? []).length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No images added yet.
                  </Typography>
                )}
              </Stack>
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
            <DialogTitle>Delete Room Type</DialogTitle>
            <DialogContent>
                <Typography sx={{ mt: 1 }}>
                Are you sure you want to delete{" "}
                <strong>{pendingDelete?.name ?? "this room type"}</strong>?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This cannot be undone. If rooms reference this type, the backend will block deletion.
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
