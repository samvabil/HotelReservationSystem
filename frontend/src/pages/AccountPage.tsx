import { useState, useMemo } from 'react';
import { 
    Container, Typography, Box, Card, CardContent, 
    Chip, Button, CircularProgress, Alert, 
    FormControl, InputLabel, Select, MenuItem, type SelectChangeEvent,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    TextField, Grid, InputAdornment, Snackbar // <--- 1. Import Snackbar
} from '@mui/material';
import { 
    useGetMyReservationsQuery, 
    useCancelReservationMutation, 
    useUpdateReservationMutation 
} from '../services/reservationApi';
import { useSearchRoomsQuery } from '../services/roomApi'; 
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; 
import dayjs from 'dayjs';

export default function AccountPage() {
    const { data: reservations, isLoading, isError } = useGetMyReservationsQuery(undefined);
    const [cancelReservation] = useCancelReservationMutation();
    const [updateReservation] = useUpdateReservationMutation();

    const [filter, setFilter] = useState<'ALL' | 'CURRENT' | 'PAST' | 'CANCELED'>('ALL');
    
    // --- STATE MANAGEMENT ---
    const [cancelId, setCancelId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any | null>(null);

    // 2. NEW STATE: Toast Notification (Open, Message, Type)
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // 3. TOAST HANDLER
    const handleCloseToast = () => {
        setToast({ ...toast, open: false });
    };

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
    const handleClickCancel = (id: string) => setCancelId(id);
    const handleCloseCancel = () => setCancelId(null);
    const handleConfirmCancel = async () => {
        if (cancelId) {
            await cancelReservation(cancelId);
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
            originalRoom: reservation.room 
        });
    };

    const handleCloseEdit = () => setEditData(null);

    const handleSaveEdit = async () => {
        if (!editData) return;
        try {
            await updateReservation({
                id: editData.id,
                checkIn: editData.checkIn,
                checkOut: editData.checkOut,
                guestCount: editData.guestCount,
                roomId: editData.roomId
            }).unwrap(); 

            setEditData(null); 
            
            // 4. REPLACED ALERT WITH TOAST (SUCCESS)
            setToast({ 
                open: true, 
                message: "Reservation updated successfully!", 
                severity: 'success' 
            });

        } catch (err: any) {
            console.error("Update failed:", err);
            
            // 4. REPLACED ALERT WITH TOAST (ERROR)
            setToast({ 
                open: true, 
                message: `Update Failed: ${err?.data?.message || "Room might not be available for these dates."}`, 
                severity: 'error' 
            });
        }
    };

    const openDatePicker = (e: React.MouseEvent<HTMLDivElement>) => {
        const input = e.currentTarget.querySelector('input');
        if (input && 'showPicker' in input) {
            (input as any).showPicker();
        }
    };

    // --- FILTER LOGIC ---
    const handleFilterChange = (event: SelectChangeEvent) => setFilter(event.target.value as any);

    const filteredReservations = reservations?.filter((res: any) => {
        const isCanceled = res.status === 'CANCELLED' || res.status === 'REFUNDED';
        const isPast = dayjs(res.checkOut).isBefore(dayjs(), 'day'); 
        switch (filter) {
            case 'CURRENT': return !isCanceled && !isPast;
            case 'PAST': return !isCanceled && isPast;
            case 'CANCELED': return isCanceled;
            case 'ALL': default: return true;
        }
    });

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (isError) return <Alert severity="error">Failed to load reservations.</Alert>;

    return (
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

            {/* EDIT RESERVATION DIALOG */}
            <Dialog open={!!editData} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Reservation</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Update your dates, guest count, or upgrade your room.
                    </DialogContentText>
                    
                    {editData && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Check-In"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={editData.checkIn}
                                    onChange={(e) => setEditData({...editData, checkIn: e.target.value})}
                                    onClick={openDatePicker} 
                                    sx={{
                                        '& .MuiInputBase-root': { cursor: 'pointer' }, 
                                        '& input': { cursor: 'pointer' },
                                        '& input::-webkit-calendar-picker-indicator': { display: 'none' } 
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <CalendarMonthIcon color="primary" sx={{ pointerEvents: 'none' }} /> 
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Check-Out"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={editData.checkOut}
                                    onChange={(e) => setEditData({...editData, checkOut: e.target.value})}
                                    onClick={openDatePicker}
                                    sx={{
                                        '& .MuiInputBase-root': { cursor: 'pointer' },
                                        '& input': { cursor: 'pointer' },
                                        '& input::-webkit-calendar-picker-indicator': { display: 'none' } 
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <CalendarMonthIcon color="primary" sx={{ pointerEvents: 'none' }} />
                                            </InputAdornment>
                                        )
                                    }}
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
                    <Button onClick={handleSaveEdit} variant="contained" color="primary">Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* CANCEL CONFIRMATION DIALOG */}
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

            {/* 5. ADD SNACKBAR COMPONENT */}
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
                    variant="filled" // Makes the toast "pop" more
                >
                    {toast.message}
                </Alert>
            </Snackbar>

        </Container>
    );
}