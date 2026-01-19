import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Tooltip,
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // <--- Added
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // <--- Added
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // <--- Added

import {
  useCancelEmployeeReservationMutation,
  useCheckInEmployeeReservationMutation,
  useCheckOutEmployeeReservationMutation,
  useGetEmployeeRevenueReportQuery,
  useSearchEmployeeReservationsQuery,
  useUpdateEmployeeReservationMutation,
} from "../services/employeeReservationsApi";

import { useGetAdminRoomTypesQuery } from "../services/employeeRoomTypesAdminApi";
import type { Reservation, ReservationStatus } from "../types/Reservation";

/**
 * Converts cents to dollars and formats as USD currency string.
 *
 * @param {number} cents - The amount in cents.
 * @returns {string} The formatted currency string (e.g., "$1,234.56").
 */
function centsToDollars(cents: number) {
  const dollars = cents / 100;
  return dollars.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

/**
 * Returns the Material-UI color name for a reservation status.
 *
 * @param {ReservationStatus} status - The reservation status.
 * @returns {string} The color name for the status chip.
 */
function statusColor(status: ReservationStatus) {
  switch (status) {
    case "CONFIRMED": return "success";
    case "CHECKED_IN": return "warning";
    case "COMPLETED": return "default";
    case "CANCELLED": return "error";
    case "REFUNDED": return "info";
    default: return "default";
  }
}

/**
 * Formats a status string by converting snake_case to Title Case.
 *
 * @param {string} s - The status string (e.g., "CHECKED_IN").
 * @returns {string} The formatted status (e.g., "Checked In").
 */
function prettyStatus(s: string) {
  return s.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Employee reservations management page.
 * <p>
 * Provides comprehensive reservation management for employees including:
 * - Search and filter reservations by guest email, room type, status, check-in status, and date range
 * - Paginated table view of reservations with sorting
 * - Edit reservations (dates, room, guest count)
 * - Cancel reservations
 * - Check-in and check-out guests
 * - Revenue reporting with monthly breakdown
 * </p>
 * <p>
 * Actions are contextual based on reservation status:
 * - Edit: Only for CONFIRMED reservations
 * - Cancel: Only for CONFIRMED reservations
 * - Check-in: Only for CONFIRMED reservations
 * - Check-out: Only for CHECKED_IN reservations
 * </p>
 *
 * @returns {JSX.Element} The employee reservations management page.
 */
export default function EmployeeReservations() {
  // Filters
  const [guestEmail, setGuestEmail] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [status, setStatus] = useState<ReservationStatus | "">("");
  const [currentlyCheckedIn, setCurrentlyCheckedIn] = useState<"" | "true" | "false">("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // Paging
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  // Revenue month filter
  const [month, setMonth] = useState<string>(""); // yyyy-mm
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // Dialogs
  const [editRow, setEditRow] = useState<Reservation | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: roomTypes } = useGetAdminRoomTypesQuery();

  const searchParams = useMemo(() => {
    return {
      guestEmail: guestEmail.trim() ? guestEmail.trim() : undefined,
      roomTypeId: roomTypeId || undefined,
      status: status || undefined,
      currentlyCheckedIn:
        currentlyCheckedIn === "" ? undefined : currentlyCheckedIn === "true",
      from: from || undefined,
      to: to || undefined,
      page,
      size,
      sortBy: "checkIn",
      sortDir: "DESC" as const,
    };
  }, [guestEmail, roomTypeId, status, currentlyCheckedIn, from, to, page, size]);

  const {
    data: reservationsPage,
    isLoading,
    isError,
    refetch,
  } = useSearchEmployeeReservationsQuery(searchParams);

  // Revenue query params (optional month filter)
  const revenueParams = useMemo(() => {
    if (!month) return {};
    const start = dayjs(`${month}-01`);
    const endExclusive = start.add(1, "month");
    return {
      from: start.format("YYYY-MM-DD"),
      to: endExclusive.format("YYYY-MM-DD"),
    };
  }, [month]);

  const { data: revenue, isLoading: revenueLoading } = useGetEmployeeRevenueReportQuery(revenueParams);

  // Fetch all-time revenue to get available months (without month filter)
  const { data: allTimeRevenue } = useGetEmployeeRevenueReportQuery({});

  // Update available months when all-time revenue data is fetched
  useMemo(() => {
    if (allTimeRevenue?.revenueByMonthCents) {
      const months = Object.keys(allTimeRevenue.revenueByMonthCents).sort().reverse();
      setAvailableMonths(months);
    }
  }, [allTimeRevenue]);

  const [updateReservation, { isLoading: updating }] = useUpdateEmployeeReservationMutation();
  const [cancelReservation, { isLoading: cancelling }] = useCancelEmployeeReservationMutation();
  const [checkIn, { isLoading: checkingIn }] = useCheckInEmployeeReservationMutation();
  const [checkOut, { isLoading: checkingOut }] = useCheckOutEmployeeReservationMutation();

  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const resetToFirstPage = () => setPage(0);

  const isEditable = (r: Reservation) =>
    r.status !== "CHECKED_IN" &&
    r.status !== "CANCELLED" &&
    r.status !== "REFUNDED" &&
    r.status !== "COMPLETED";

  const isCancelable = (r: Reservation) =>
    r.status !== "CHECKED_IN" &&
    r.status !== "CANCELLED" &&
    r.status !== "REFUNDED" &&
    r.status !== "COMPLETED";

  const canCheckIn = (r: Reservation) => r.status === "CONFIRMED";
  const canCheckOut = (r: Reservation) => r.status === "CHECKED_IN";

  const handleSaveEdit = async () => {
    if (!editRow) return;

    try {
      await updateReservation({
        id: editRow.id,
        body: {
          roomId: editRow.roomId,
          checkIn: editRow.checkIn,
          checkOut: editRow.checkOut,
          guestCount: editRow.guestCount,
        },
      }).unwrap();

      setEditRow(null);
      setToast({ open: true, message: "Reservation updated.", severity: "success" });
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.data?.message || "Update failed.",
        severity: "error",
      });
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelId) return;
    try {
      await cancelReservation(cancelId).unwrap();
      setCancelId(null);
      setToast({ open: true, message: "Reservation cancelled.", severity: "success" });
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.data?.message || "Cancel failed.",
        severity: "error",
      });
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await checkIn(id).unwrap();
      setToast({ open: true, message: "Checked in.", severity: "success" });
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.data?.message || "Check-in failed.",
        severity: "error",
      });
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await checkOut(id).unwrap();
      setToast({ open: true, message: "Checked out.", severity: "success" });
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.data?.message || "Check-out failed.",
        severity: "error",
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Stack spacing={2}>
            <Typography variant="h4" fontWeight="bold">
            Manage Reservations
            </Typography>

            {/* Revenue card */}
            <Card sx={{ border: "1px solid #333" }}>
            <CardContent>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                    Revenue
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                    Succeeded payments only. Total is confirmed + completed minus refunded.
                    <availableMonths.map((m) => (
                        <MenuItem key={m} value={m}>
                            {m}
                        </MenuItem>
                    ))
                    <MenuItem value="">All time</MenuItem>
                    {revenue?.revenueByMonthCents
                        ? Object.keys(revenue.revenueByMonthCents)
                            .sort()
                            .reverse()
                            .map((m) => (
                            <MenuItem key={m} value={m}>
                                {m}
                            </MenuItem>
                            ))
                        : null}
                    </Select>
                </FormControl>

                <Box sx={{ minWidth: 260, textAlign: { xs: "left", md: "right" } }}>
                    {revenueLoading ? (
                    <CircularProgress size={22} />
                    ) : (
                    <>
                        <Typography variant="h5" fontWeight="bold">
                        {centsToDollars(revenue?.totalRevenueCents ?? 0)}
                        </Typography>
                        {month && revenue?.revenueByMonthCents?.[month] != null ? (
                        <Typography variant="body2" color="text.secondary">
                            {month}: {centsToDollars(revenue.revenueByMonthCents[month])}
                        </Typography>
                        ) : (
                        <Typography variant="body2" color="text.secondary">
                            Totals by month available
                        </Typography>
                        )}
                    </>
                    )}
                </Box>
                </Stack>
            </CardContent>
            </Card>

            {/* Filters */}
            <Card sx={{ border: "1px solid #333" }}>
            <CardContent>
                <Stack spacing={2}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                    label="Guest Email"
                    value={guestEmail}
                    onChange={(e) => {
                        setGuestEmail(e.target.value);
                        resetToFirstPage();
                    }}
                    fullWidth
                    />

                    <FormControl fullWidth>
                    <InputLabel>Room Type</InputLabel>
                    <Select
                        value={roomTypeId}
                        label="Room Type"
                        onChange={(e) => {
                        setRoomTypeId(e.target.value);
                        resetToFirstPage();
                        }}
                    >
                        <MenuItem value="">All</MenuItem>
                        {roomTypes?.map((rt) => (
                        <MenuItem key={rt.id} value={rt.id}>
                            {rt.name}
                        </MenuItem>
                        ))}
                    </Select>
                    </FormControl>

                    <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={status}
                        label="Status"
                        onChange={(e) => {
                        setStatus(e.target.value as any);
                        resetToFirstPage();
                        }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                        <MenuItem value="CHECKED_IN">Checked in</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        <MenuItem value="REFUNDED">Refunded</MenuItem>
                    </Select>
                    </FormControl>

                    <FormControl fullWidth>
                    <InputLabel>Currently Checked In</InputLabel>
                    <Select
                        value={currentlyCheckedIn}
                        label="Currently Checked In"
                        onChange={(e) => {
                        setCurrentlyCheckedIn(e.target.value as any);
                        resetToFirstPage();
                        }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="true">Yes</MenuItem>
                        <MenuItem value="false">No</MenuItem>
                    </Select>
                    </FormControl>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <DatePicker
                        label="From (overlap)"
                        value={from ? dayjs(from) : null}
                        onChange={(newValue) => {
                            setFrom(newValue ? newValue.format("YYYY-MM-DD") : "");
                            resetToFirstPage();
                        }}
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                    <DatePicker
                        label="To (overlap)"
                        value={to ? dayjs(to) : null}
                        onChange={(newValue) => {
                            setTo(newValue ? newValue.format("YYYY-MM-DD") : "");
                            resetToFirstPage();
                        }}
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                    <Button variant="outlined" size="small" onClick={() => refetch()}>
                    Refresh
                    </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    Date filtering matches stays whose window overlaps the selected range.
                </Typography>
                </Stack>
            </CardContent>
            </Card>

            {/* Table */}
            <Card sx={{ border: "1px solid #333" }}>
            <CardContent>
                {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
                ) : isError ? (
                <Alert severity="error">
                    Failed to load reservations.
                </Alert>
                ) : (
                <>
                    <TableContainer component={Paper} sx={{ backgroundColor: "transparent" }}>
                    <Table size="small">
                        <TableHead>
                        <TableRow>
                            <TableCell>Guest</TableCell>
                            <TableCell>Room</TableCell>
                            <TableCell>Room Type</TableCell>
                            <TableCell>Dates</TableCell>
                            <TableCell align="right">Guests</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="center">Checked In</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {reservationsPage?.items?.map((r) => {
                            const checkedIn = r.status === "CHECKED_IN";
                            const amountCents = r.transaction?.amountCents;

                            return (
                            <TableRow key={r.id} hover>
                                <TableCell>
                                <Stack spacing={0.5}>
                                    <Typography variant="body2" fontWeight="bold">
                                    {r.user?.email || r.userId}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                    {r.user?.firstName ? `${r.user.firstName} ${r.user.lastName}` : ""}
                                    </Typography>
                                </Stack>
                                </TableCell>

                                <TableCell>
                                {r.room?.roomNumber || r.roomId}
                                </TableCell>

                                <TableCell>
                                {r.room?.roomTypeId?.name || ""}
                                </TableCell>

                                <TableCell>
                                <Typography variant="body2">
                                    {dayjs(r.checkIn).format("MMM D, YYYY")} to {dayjs(r.checkOut).format("MMM D, YYYY")}
                                </Typography>
                                </TableCell>

                                <TableCell align="right">{r.guestCount}</TableCell>

                                <TableCell>
                                <Chip
                                    size="small"
                                    label={prettyStatus(r.status)}
                                    color={statusColor(r.status) as any}
                                    variant="outlined"
                                />
                                </TableCell>

                                <TableCell align="right">
                                {amountCents != null ? centsToDollars(amountCents) : r.totalPrice?.toFixed ? `$${r.totalPrice.toFixed(2)}` : ""}
                                </TableCell>

                                <TableCell align="center">
                                <Chip
                                    size="small"
                                    label={checkedIn ? "Yes" : "No"}
                                    variant="outlined"
                                />
                                </TableCell>

                                <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Tooltip title={isEditable(r) ? "Edit" : "Edit not allowed for this status"}>
                                    <span>
                                        <Button
                                        size="small"
                                        variant="contained"
                                        disabled={!isEditable(r) || updating}
                                        onClick={() => setEditRow({ ...r })}
                                        >
                                        Edit
                                        </Button>
                                    </span>
                                    </Tooltip>

                                    <Tooltip title={isCancelable(r) ? "Cancel" : "Cancel not allowed for this status"}>
                                    <span>
                                        <Button
                                        size="small"
                                        variant="contained"
                                        color="error"
                                        disabled={!isCancelable(r) || cancelling}
                                        onClick={() => setCancelId(r.id)}
                                        >
                                        Cancel
                                        </Button>
                                    </span>
                                    </Tooltip>

                                    <Tooltip title={canCheckIn(r) ? "Check in" : "Only CONFIRMED can be checked in"}>
                                    <span>
                                        <Button
                                        size="small"
                                        variant="outlined"
                                        disabled={!canCheckIn(r) || checkingIn}
                                        onClick={() => handleCheckIn(r.id)}
                                        >
                                        Check-in
                                        </Button>
                                    </span>
                                    </Tooltip>

                                    <Tooltip title={canCheckOut(r) ? "Check out" : "Only CHECKED_IN can be checked out"}>
                                    <span>
                                        <Button
                                        size="small"
                                        variant="outlined"
                                        disabled={!canCheckOut(r) || checkingOut}
                                        onClick={() => handleCheckOut(r.id)}
                                        >
                                        Check-out
                                        </Button>
                                    </span>
                                    </Tooltip>
                                </Stack>
                                </TableCell>
                            </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>
                    </TableContainer>

                    <Divider sx={{ my: 2 }} />

                    <TablePagination
                    component="div"
                    count={reservationsPage?.totalItems ?? 0}
                    page={page}
                    onPageChange={(_e, newPage) => setPage(newPage)}
                    rowsPerPage={size}
                    onRowsPerPageChange={(e) => {
                        setSize(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 20, 50]}
                    />
                </>
                )}
            </CardContent>
            </Card>
        </Stack>

        {/* Edit dialog */}
        <Dialog open={!!editRow} onClose={() => setEditRow(null)} maxWidth="sm" fullWidth>
            <DialogTitle fontWeight="bold">Edit Reservation</DialogTitle>
            <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
                Reservation ID is hidden in the table, but used internally for updates.
            </DialogContentText>

            {editRow && (
                <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                    label="Room ID"
                    value={editRow.roomId}
                    onChange={(e) => setEditRow({ ...editRow, roomId: e.target.value })}
                    fullWidth
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <DatePicker
                        label="Check-In"
                        value={editRow.checkIn ? dayjs(editRow.checkIn) : null}
                        onChange={(newValue) => setEditRow({ ...editRow, checkIn: newValue ? newValue.format("YYYY-MM-DD") : "" })}
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                    <DatePicker
                        label="Check-Out"
                        value={editRow.checkOut ? dayjs(editRow.checkOut) : null}
                        onChange={(newValue) => setEditRow({ ...editRow, checkOut: newValue ? newValue.format("YYYY-MM-DD") : "" })}
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                </Stack>

                <TextField
                    label="Guest Count"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={editRow.guestCount}
                    onChange={(e) =>
                    setEditRow({ ...editRow, guestCount: parseInt(e.target.value || "1", 10) })
                    }
                    fullWidth
                />
                </Stack>
            )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditRow(null)} variant="outlined" color="inherit">
                Close
            </Button>
            <Button
                onClick={handleSaveEdit}
                variant="contained"
                disabled={!editRow || updating || (editRow ? !isEditable(editRow) : true)}
            >
                Save
            </Button>
            </DialogActions>
        </Dialog>

        {/* Cancel dialog */}
        <Dialog open={!!cancelId} onClose={() => setCancelId(null)}>
            <DialogTitle fontWeight="bold" sx={{ color: "error.main" }}>
            Cancel Reservation?
            </DialogTitle>
            <DialogContent>
            <DialogContentText>
                This will cancel the reservation. Refund behavior depends on backend rules.
            </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCancelId(null)} variant="outlined" color="inherit">
                Keep
            </Button>
            <Button
                onClick={handleConfirmCancel}
                variant="contained"
                color="error"
                disabled={cancelling}
            >
                Cancel reservation
            </Button>
            </DialogActions>
        </Dialog>

        {/* Toast */}
        <Snackbar
            open={toast.open}
            autoHideDuration={6000}
            onClose={closeToast}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert onClose={closeToast} severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
            {toast.message}
            </Alert>
        </Snackbar>
        </Container>
    </LocalizationProvider>
  );
}