import { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux'; 
import { useNavigate } from 'react-router-dom'; 
import { 
    Container, Typography, Box, Card, CardContent, 
    Chip, Button, CircularProgress, Alert, 
    FormControl, InputLabel, Select, MenuItem, type SelectChangeEvent,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    TextField, Grid, Snackbar 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // <--- Added
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // <--- Added
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // <--- Added
import { 
    useGetMyReservationsQuery, 
    useCancelReservationMutation, 
    useUpdateReservationMutation 
} from '../services/reservationApi';
import { useSearchRoomsQuery } from '../services/roomApi'; 
import { setDatesAndGuests, selectRoom, startModification } from '../store/bookingSlice'; 
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs';

/**
 * User account page for managing reservations.
 * <p>
 * Displays the authenticated user's reservations with filtering options (All, Current, Past, Canceled).
 * Allows users to:
 * - View all reservations with status indicators
 * - Edit reservations (dates, guests, room type)
 * - Cancel reservations (with refund eligibility notice)
 * </p>
 * <p>
 * Edit functionality handles price differences:
 * - Upgrades (price increase): Redirects to checkout for additional payment
 * - Downgrades/refunds (price decrease): Processes refund automatically
 * - No change: Updates immediately
 * </p>
 * <p>
 * Reservations are sorted by status priority (upcoming > completed > refunded > canceled) and then by date.
 * </p>
 *
 * @returns {JSX.Element} The user account management page.
 */
export default function AccountPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { data: reservations, isLoading, isError } = useGetMyReservationsQuery(undefined);
    const [cancelReservation] = useCancelReservationMutation();
    const [updateReservation] = useUpdateReservationMutation();

    const [filter, setFilter] = useState<'ALL' | 'CURRENT' | 'PAST' | 'CANCELED'>('ALL');
    
    // --- STATE MANAGEMENT ---
    const [cancelId, setCancelId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any | null>(null);
    
    // NEW: Confirmation Modal State for Upgrades/Refunds
    const [confirmModal, setConfirmModal] = useState<{ 
        open: boolean, 
        type: 'UPGRADE' | 'REFUND' | 'SAME', 
        diff: number, 
        newTotal: number 
    } | null>(null);

    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // --- DYNAMIC SEARCH FOR EDITING ---
    const searchCriteria = useMemo(() => {
        if (!editData) return undefined; 

        return {
            checkInDate: editData.checkIn,
            checkOutDate: editData.checkOut,
            guestCount: editData.guestCount,
            filters: {
                accessible: editData.originalRoom?.accessible,
                petFriendly: editData.originalRoom?.petFriendly,
                nonSmoking: editData.originalRoom?.nonSmoking,
                hasJacuzzi: false 
            },
            gamingPreferences: {} 
        };
    }, [editData]);

    const { data: searchResults } = useSearchRoomsQuery(searchCriteria as any, { skip: !editData });

    // --- HANDLERS ---

    const handleCloseToast = () => {
        setToast({ ...toast, open: false });
    };

    const handleClickCancel = (id: string) => setCancelId(id);
    const handleCloseCancel = () => setCancelId(null);
    
    const handleConfirmCancel = async () => {
        if (cancelId) {
            try {
                await cancelReservation(cancelId).unwrap();
                setToast({ open: true, message: "Reservation canceled successfully.", severity: 'success' });
            } catch (err) {
                setToast({ open: true, message: "Failed to cancel reservation.", severity: 'error' });
            }
            setCancelId(null);
        }
    };

    const handleClickEdit = (reservation: any) => {
        setEditData({
            id: reservation.id,
            checkIn: reservation.checkIn,
            checkOut: reservation.checkOut,
            guestCount: reservation.guestCount,
            roomId: reservation.roomId, 
            roomTypeId: reservation.room?.roomTypeId?.id || reservation.room?.roomTypeId,
            originalRoom: reservation.room,
            oldTotal: reservation.totalPrice // Capture old price for comparison
        });
    };

    const handleCloseEdit = () => setEditData(null);

    // 1. PRE-CHECK: Calculate Price Difference
    const handlePreSaveCheck = () => {
        if (!editData) return;

        // A. Find New Price info
        let newPricePerNight = 0;
        
        // If room type didn't change, get price from original room data
        if (editData.roomTypeId === editData.originalRoom?.roomTypeId?.id) {
            newPricePerNight = editData.originalRoom.roomTypeId.pricePerNight;
        } else {
            // If changed, find price in search results
            const result = searchResults?.find((r: any) => r.roomType.id === editData.roomTypeId);
            if (result) newPricePerNight = result.roomType.pricePerNight;
        }

        // B. Calculate New Total
        const checkIn = dayjs(editData.checkIn);
        const checkOut = dayjs(editData.checkOut);
        const nights = Math.max(1, checkOut.diff(checkIn, 'day'));
        const newTotal = newPricePerNight * nights;

        // C. Compare with Old Total
        const oldTotal = editData.oldTotal || 0; 
        const diff = newTotal - oldTotal;

        // D. Open Confirmation Modal based on result
        if (diff > 0) {
            setConfirmModal({ open: true, type: 'UPGRADE', diff, newTotal });
        } else if (diff < 0) {
            setConfirmModal({ open: true, type: 'REFUND', diff, newTotal });
        } else {
            // No price change, just save immediately
            processUpdate(); 
        }
    };

    // 2. EXECUTE UPDATE (Or Redirect)
    const processUpdate = async () => {
        // CASE A: Upgrade (Redirect to Checkout)
        if (confirmModal?.type === 'UPGRADE') {
            // Update Redux so CheckoutPage knows what to do
            dispatch(setDatesAndGuests({
                checkIn: editData.checkIn,
                checkOut: editData.checkOut,
                guests: editData.guestCount
            }));
            dispatch(selectRoom(editData.roomId));
            dispatch(startModification(editData.id)); 

            navigate(`/checkout/${editData.roomId}`);
            return; 
        }

        // CASE B: Refund or Same Price (Call API directly)
        try {
            await updateReservation({
                id: editData.id,
                checkIn: editData.checkIn,
                checkOut: editData.checkOut,
                guestCount: editData.guestCount,
                roomId: editData.roomId,
                // paymentIntentId is null here because we aren't charging
            }).unwrap();

            setConfirmModal(null);
            setEditData(null);
            setToast({ 
                open: true, 
                message: confirmModal?.type === 'REFUND' 
                    ? `Reservation updated! A refund of $${Math.abs(confirmModal.diff).toFixed(2)} has been initiated.`
                    : "Reservation updated successfully!", 
                severity: 'success' 
            });

        } catch (err: any) {
            console.error("Update failed:", err);
            setToast({ 
                open: true, 
                message: `Update Failed: ${err?.data?.message || "Room might not be available."}`, 
                severity: 'error' 
            });
            setConfirmModal(null); 
        }
    };

    const handleCloseConfirm = () => setConfirmModal(null);

    const handleFilterChange = (event: SelectChangeEvent) => setFilter(event.target.value as any);

    // --- SORTING LOGIC START ---
    const filteredReservations = reservations
        ?.filter((res: any) => {
            const isCanceled = res.status === 'CANCELLED' || res.status === 'REFUNDED';
            const isPast = dayjs(res.checkOut).isBefore(dayjs(), 'day'); 
            switch (filter) {
                case 'CURRENT': return !isCanceled && !isPast;
                case 'PAST': return !isCanceled && isPast;
                case 'CANCELED': return isCanceled;
                case 'ALL': default: return true;
            }
        })
        .sort((a: any, b: any) => {
            const getPriority = (res: any) => {
                const isCanceled = res.status === 'CANCELLED';
                const isRefunded = res.status === 'REFUNDED';
                const isPast = dayjs(res.checkOut).isBefore(dayjs(), 'day');

                if (isCanceled) return 4;
                if (isRefunded) return 3;
                if (isPast) return 2;
                return 1; // Upcoming
            };

            const priorityA = getPriority(a);
            const priorityB = getPriority(b);

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            return dayjs(a.checkIn).diff(dayjs(b.checkIn));
        });
    // --- SORTING LOGIC END ---

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (isError) return <Alert severity="error">Failed to load reservations.</Alert>;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
                
                {/* HEADER */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                            My Account
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage your stays and history
                        </Typography>
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Filter View</InputLabel>
                        <Select value={filter} label="Filter View" onChange={handleFilterChange}>
                            <MenuItem value="ALL">Show All</MenuItem>
                            <MenuItem value="CURRENT">Current / Upcoming</MenuItem>
                            <MenuItem value="PAST">Past Stays</MenuItem>
                            <MenuItem value="CANCELED">Canceled</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* RESERVATION LIST */}
                {filteredReservations?.length === 0 ? (
                    <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
                        No {filter.toLowerCase()} reservations found.
                    </Alert>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {filteredReservations?.map((res: any) => {
                            const isStayPast = dayjs(res.checkOut).isBefore(dayjs(), 'day');
                            const isRefunded = res.status === 'REFUNDED';
                            const isCanceled = res.status === 'CANCELLED';

                            return (
                                <Card 
                                    key={res.id} 
                                    elevation={3} 
                                    sx={{ 
                                        borderRadius: 2, 
                                        opacity: (isStayPast || isCanceled || isRefunded) ? 0.7 : 1, 
                                        borderLeft: (isCanceled || isRefunded) ? '6px solid #d32f2f' : '6px solid #2e7d32' 
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                            <Box>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {res.room?.roomTypeId?.name || "Room Info Unavailable"}
                                                    </Typography>
                                                    
                                                    <Chip 
                                                        label={isRefunded ? "REFUNDED" : isCanceled ? "CANCELED" : isStayPast ? "COMPLETED" : "UPCOMING"} 
                                                        color={isRefunded ? 'info' : isCanceled ? 'error' : isStayPast ? 'default' : 'success'} 
                                                        size="small" 
                                                        variant={isCanceled || isStayPast || isRefunded ? 'outlined' : 'filled'}
                                                    />
                                                </Box>
                                                
                                                <Typography variant="body2" color="text.secondary">
                                                    Room {res.room?.roomNumber} • {res.guestCount} Guest(s)
                                                </Typography>
                                                <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
                                                    {dayjs(res.checkIn).format('MMM D, YYYY')} — {dayjs(res.checkOut).format('MMM D, YYYY')}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h6" sx={{ mb: 2 }}>${res.totalPrice.toFixed(2)}</Typography>
                                                {!isCanceled && !isRefunded && !isStayPast && (
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                        <Button variant="contained" startIcon={<EditIcon />} size="small" onClick={() => handleClickEdit(res)}>
                                                            Edit
                                                        </Button>
                                                        <Button variant="contained" color="error" startIcon={<DeleteIcon />} size="small" onClick={() => handleClickCancel(res.id)}>
                                                            Cancel
                                                        </Button>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                )}

                {/* --- EDIT RESERVATION DIALOG --- */}
                <Dialog open={!!editData} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Reservation</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            Update your dates, guest count, or upgrade your room.
                        </DialogContentText>
                        
                        {editData && (
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid size={{ xs: 6 }}>
                                    <DatePicker
                                        label="Check-In"
                                        value={editData.checkIn ? dayjs(editData.checkIn) : null}
                                        onChange={(newValue) => setEditData({ ...editData, checkIn: newValue ? newValue.format('YYYY-MM-DD') : '' })}
                                        slotProps={{ textField: { fullWidth: true } }}
                                        disablePast
                                    />
                                </Grid>
                                
                                <Grid size={{ xs: 6 }}>
                                    <DatePicker
                                        label="Check-Out"
                                        value={editData.checkOut ? dayjs(editData.checkOut) : null}
                                        onChange={(newValue) => setEditData({ ...editData, checkOut: newValue ? newValue.format('YYYY-MM-DD') : '' })}
                                        slotProps={{ textField: { fullWidth: true } }}
                                        minDate={editData.checkIn ? dayjs(editData.checkIn).add(1, 'day') : undefined}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Number of Guests"
                                        type="number"
                                        fullWidth
                                        inputProps={{ min: 1 }}
                                        value={editData.guestCount}
                                        onChange={(e) => setEditData({...editData, guestCount: parseInt(e.target.value)})}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Room Type</InputLabel>
                                        <Select
                                            value={editData.roomTypeId}
                                            label="Room Type"
                                            onChange={(e) => {
                                                const newTypeId = e.target.value;
                                                if (newTypeId === editData.originalRoom?.roomTypeId?.id) {
                                                    setEditData({ ...editData, roomTypeId: newTypeId, roomId: editData.originalRoom.id });
                                                } else {
                                                    const result = searchResults?.find((r: any) => r.roomType.id === newTypeId);
                                                    if (result && result.availableRooms.length > 0) {
                                                        setEditData({ ...editData, roomTypeId: newTypeId, roomId: result.availableRooms[0].id });
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuItem value={editData.originalRoom?.roomTypeId?.id || editData.originalRoom?.roomTypeId}>
                                                {editData.originalRoom?.roomTypeId?.name || "Current Room"} (Keep Current)
                                            </MenuItem>

                                            {searchResults?.map((res: any) => {
                                                if (res.roomType.id === (editData.originalRoom?.roomTypeId?.id || editData.originalRoom?.roomTypeId)) return null;
                                                return (
                                                    <MenuItem key={res.roomType.id} value={res.roomType.id}>
                                                        {res.roomType.name} - ${res.roomType.pricePerNight}/night
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseEdit} variant="outlined" color="inherit">Cancel</Button>
                        <Button onClick={handlePreSaveCheck} variant="contained" color="primary">Review Changes</Button>
                    </DialogActions>
                </Dialog>

                {/* --- PRICE CONFIRMATION MODAL --- */}
                <Dialog open={!!confirmModal} onClose={handleCloseConfirm} maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>
                        {confirmModal?.type === 'UPGRADE' ? 'Additional Payment Required' : 'Confirm Update'}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {confirmModal?.type === 'UPGRADE' && (
                                <>
                                    This change increases the total cost by <strong>${confirmModal.diff.toFixed(2)}</strong>.
                                    <br /><br />
                                    You will be redirected to checkout to pay the full new amount (<strong>${confirmModal.newTotal.toFixed(2)}</strong>).
                                    Your previous payment will be automatically refunded.
                                </>
                            )}
                            {confirmModal?.type === 'REFUND' && (
                                <>
                                    This change decreases the total cost by <strong>${Math.abs(confirmModal.diff).toFixed(2)}</strong>.
                                    <br /><br />
                                    The difference will be automatically refunded to your original payment method.
                                </>
                            )}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseConfirm} color="inherit">Cancel</Button>
                        <Button onClick={processUpdate} variant="contained" color="primary">
                            {confirmModal?.type === 'UPGRADE' ? 'Proceed to Checkout' : 'Confirm Update'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* --- CANCEL CONFIRMATION DIALOG --- */}
                <Dialog open={!!cancelId} onClose={handleCloseCancel}>
                    <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>Cancel Reservation?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to cancel this booking? This action cannot be undone. You will be refunded if you cancel 72 hours or more before check-in.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseCancel} color="inherit" variant="outlined">No, Keep It</Button>
                        <Button onClick={handleConfirmCancel} color="error" variant="contained" autoFocus>Yes, Cancel It</Button>
                    </DialogActions>
                </Dialog>

                {/* --- SNACKBAR --- */}
                <Snackbar 
                    open={toast.open} 
                    autoHideDuration={6000} 
                    onClose={handleCloseToast}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={handleCloseToast} 
                        severity={toast.severity} 
                        sx={{ width: '100%' }}
                        variant="filled" 
                    >
                        {toast.message}
                    </Alert>
                </Snackbar>

            </Container>
        </LocalizationProvider>
    );
}