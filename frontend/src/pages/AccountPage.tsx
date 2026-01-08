import { useState } from 'react';
import { 
    Container, Typography, Box, Card, CardContent, 
    Chip, Button, Grid, CircularProgress, Alert, 
    FormControl, InputLabel, Select, MenuItem, type SelectChangeEvent
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

    // FILTER STATE: Default to 'ALL'
    const [filter, setFilter] = useState<'ALL' | 'CURRENT' | 'PAST' | 'CANCELED'>('ALL');

    const handleCancel = async (id: string) => {
        if (window.confirm("Are you sure you want to cancel this reservation? This cannot be undone.")) {
            await cancelReservation(id);
        }
    };

    const handleFilterChange = (event: SelectChangeEvent) => {
        setFilter(event.target.value as any);
    };

    // --- FILTER LOGIC ---
    const filteredReservations = reservations?.filter((res: any) => {
        const isCanceled = res.status === 'CANCELLED';
        const isPast = dayjs(res.checkOut).isBefore(dayjs(), 'day'); 

        switch (filter) {
            case 'CURRENT':
                return !isCanceled && !isPast;
            case 'PAST':
                return !isCanceled && isPast;
            case 'CANCELED':
                return isCanceled;
            case 'ALL':
            default:
                return true;
        }
    });

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (isError) return <Alert severity="error">Failed to load reservations.</Alert>;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            
            {/* HEADER & FILTER BAR */}
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
                    <Select
                        value={filter}
                        label="Filter View"
                        onChange={handleFilterChange}
                    >
                        <MenuItem value="ALL">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Show All
                            </Box>
                        </MenuItem>
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

            {/* LIST */}
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
                                    <Grid container spacing={2} alignItems="center">
                                        
                                        {/* Left: Info */}
                                        <Grid size={{ xs: 12, md: 8 }}>
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
                                        </Grid>

                                        {/* Right: Actions */}
                                        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'right' }}>
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                ${res.totalPrice.toFixed(2)}
                                            </Typography>
                                            
                                            {!isStayCanceled && !isStayPast && (
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                                    {/* CHANGED TO CONTAINED */}
                                                    <Button variant="contained" startIcon={<EditIcon />} size="small">
                                                        Edit
                                                    </Button>
                                                    
                                                    {/* CHANGED TO CONTAINED */}
                                                    <Button 
                                                        variant="contained" 
                                                        color="error" 
                                                        startIcon={<DeleteIcon />} 
                                                        size="small"
                                                        onClick={() => handleCancel(res.id)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Box>
                                            )}
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            )}
        </Container>
    );
}