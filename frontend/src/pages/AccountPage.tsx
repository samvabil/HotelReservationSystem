import { useState } from 'react';
import { 
    Container, Typography, Box, Card, CardContent, 
    Chip, Button, CircularProgress, Alert, 
    FormControl, InputLabel, Select, MenuItem, type SelectChangeEvent,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { useGetMyReservationsQuery, useCancelReservationMutation } from '../services/reservationApi';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HistoryIcon from '@mui/icons-material/History';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';

export default function AccountPage() {
    const { data: reservations, isLoading, isError } = useGetMyReservationsQuery(undefined);
    const [cancelReservation] = useCancelReservationMutation();

    const [filter, setFilter] = useState<'ALL' | 'CURRENT' | 'PAST' | 'CANCELED'>('ALL');
    
    // Tracks which reservation ID to cancel. Null = Dialog Closed.
    const [cancelId, setCancelId] = useState<string | null>(null);

    // --- DIALOG HANDLERS ---
    const handleClickCancel = (id: string) => {
        setCancelId(id); // Open Dialog
    };

    const handleCloseDialog = () => {
        setCancelId(null); // Close Dialog
    };

    const handleConfirmCancel = async () => {
        if (cancelId) {
            await cancelReservation(cancelId);
            setCancelId(null);
        }
    };

    const handleFilterChange = (event: SelectChangeEvent) => {
        setFilter(event.target.value as any);
    };

    const filteredReservations = reservations?.filter((res: any) => {
        const isCanceled = res.status === 'CANCELLED';
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
                        <MenuItem value="CURRENT">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventAvailableIcon fontSize="small" color="primary" /> Current / Upcoming
                            </Box>
                        </MenuItem>
                        <MenuItem value="PAST">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HistoryIcon fontSize="small" color="action" /> Past Stays
                            </Box>
                        </MenuItem>
                        <MenuItem value="CANCELED">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CancelIcon fontSize="small" color="error" /> Canceled
                            </Box>
                        </MenuItem>
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
                        const isStayCanceled = res.status === 'CANCELLED';

                        return (
                            <Card 
                                key={res.id} 
                                elevation={3} 
                                sx={{ 
                                    borderRadius: 2, 
                                    opacity: (isStayPast || isStayCanceled) ? 0.7 : 1, 
                                    borderLeft: isStayCanceled ? '6px solid #d32f2f' : '6px solid #2e7d32' 
                                }}
                            >
                                <CardContent>
                                    {/* FLEXBOX LAYOUT (Fixes the "Middle" Issue) */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', // Pushes items to edges
                                        alignItems: 'center', 
                                        flexWrap: 'wrap', // Wraps nicely on mobile
                                        gap: 2 
                                    }}>
                                        
                                        {/* LEFT SIDE: ROOM INFO */}
                                        <Box>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {res.room?.roomTypeId?.name || "Room Info Unavailable"}
                                                </Typography>
                                                
                                                <Chip 
                                                    label={isStayCanceled ? "CANCELED" : isStayPast ? "COMPLETED" : "UPCOMING"} 
                                                    color={isStayCanceled ? 'error' : isStayPast ? 'default' : 'success'} 
                                                    size="small" 
                                                    variant={isStayCanceled || isStayPast ? 'outlined' : 'filled'}
                                                />
                                            </Box>
                                            
                                            <Typography variant="body2" color="text.secondary">
                                                Room {res.room?.roomNumber} • {res.guestCount} Guest(s)
                                            </Typography>
                                            <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
                                                {dayjs(res.checkIn).format('MMM D, YYYY')} — {dayjs(res.checkOut).format('MMM D, YYYY')}
                                            </Typography>
                                        </Box>

                                        {/* RIGHT SIDE: ACTIONS & PRICE */}
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                ${res.totalPrice.toFixed(2)}
                                            </Typography>
                                            
                                            {!isStayCanceled && !isStayPast && (
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                    <Button variant="contained" startIcon={<EditIcon />} size="small">
                                                        Edit
                                                    </Button>
                                                    
                                                    <Button 
                                                        variant="contained" 
                                                        color="error" 
                                                        startIcon={<DeleteIcon />} 
                                                        size="small"
                                                        onClick={() => handleClickCancel(res.id)}
                                                    >
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

            {/* CUSTOM CONFIRMATION DIALOG */}
            <Dialog
                open={!!cancelId} 
                onClose={handleCloseDialog}
            >
                <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    Cancel Reservation?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel this booking? This action cannot be undone and your room will be released immediately. You will be refuned if you cancel 72 hours or more before checkin.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit" variant="outlined">
                        No, Keep It
                    </Button>
                    <Button onClick={handleConfirmCancel} color="error" variant="contained" autoFocus>
                        Yes, Cancel It
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}