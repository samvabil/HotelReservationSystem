import { 
  Box, Button, TextField, Paper, MenuItem, Grid, 
  Accordion, AccordionSummary, AccordionDetails, 
  Typography, FormControlLabel, Checkbox, Chip, 
  Select, InputLabel, FormControl, OutlinedInput
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { 
  setDatesAndGuests,
  setGuestCount,
  setFilters, 
  setGamingPreferences, 
  clearBookingState 
} from '../store/bookingSlice';

/** Available gaming console options for filtering. */
const CONSOLE_OPTIONS = ["PS5", "Xbox Series X", "Nintendo Switch", "Retro Arcade"];
/** Available PC performance tier options for filtering. */
const PC_TIER_OPTIONS = ["Standard", "High-End", "God-Tier"];
/** Available room type options for filtering. */
const ROOM_TYPES = ["Standard", "Suite", "Penthouse", "Gaming Bunker"];

/**
 * Search bar component for filtering available rooms.
 * <p>
 * Provides controls for:
 * - Check-in and check-out dates
 * - Guest count
 * - Advanced filters (price range, room type, beds, bedrooms, amenities)
 * - Gaming equipment preferences (PC count, PC tier, consoles)
 * </p>
 * <p>
 * All filter changes are automatically saved to Redux state and localStorage.
 * The onSearch callback is invoked whenever filters change to trigger a room search.
 * </p>
 *
 * @param {Object} props - Component props.
 * @param {() => void} props.onSearch - Callback function invoked when search criteria change.
 * @returns {JSX.Element} A search form with date pickers, filters, and gaming preferences.
 */
export default function SearchRoomsBar({ onSearch }: { onSearch: () => void }) {
  const dispatch = useDispatch();
  const bookingState = useSelector((state: RootState) => state.booking);

  // --- HANDLERS ---

  const handleDateChange = (key: 'checkIn' | 'checkOut', newValue: Dayjs | null) => {
    const currentCheckIn = bookingState.checkInDate ? dayjs(bookingState.checkInDate) : null;
    const currentCheckOut = bookingState.checkOutDate ? dayjs(bookingState.checkOutDate) : null;
    
    const newCheckIn = key === 'checkIn' ? newValue : currentCheckIn;
    const newCheckOut = key === 'checkOut' ? newValue : currentCheckOut;

    dispatch(setDatesAndGuests({
      checkIn: newCheckIn ? newCheckIn.toISOString() : null as any,
      checkOut: newCheckOut ? newCheckOut.toISOString() : null as any,
      guests: bookingState.guestCount
    }));
    onSearch();
  };

  const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setGuestCount(Number(e.target.value)));
    onSearch();
  };

  const handleFilterChange = (key: keyof typeof bookingState.filters, value: any) => {
    const newFilters = { ...bookingState.filters, [key]: value };
    dispatch(setFilters(newFilters));
    onSearch();
  };

  const handleGamingChange = (key: keyof typeof bookingState.gamingPreferences, value: any) => {
    const newGaming = { ...bookingState.gamingPreferences, [key]: value };
    dispatch(setGamingPreferences(newGaming));
    onSearch();
  };

  const handleClear = () => {
    dispatch(clearBookingState());
    onSearch();
  };

  const toNumberOrNull = (val: string) => val === '' ? null : Number(val);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        
        {/* --- TOP ROW: DATES & GUESTS --- */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <DatePicker
            label="Check-in"
            value={bookingState.checkInDate ? dayjs(bookingState.checkInDate) : null}
            onChange={(val) => handleDateChange('checkIn', val)}
            disablePast
            slotProps={{ textField: { size: 'small', sx: { flexGrow: 1 } } }}
          />
          <DatePicker
            label="Check-out"
            value={bookingState.checkOutDate ? dayjs(bookingState.checkOutDate) : null}
            minDate={bookingState.checkInDate ? dayjs(bookingState.checkInDate).add(1, 'day') : undefined}
            onChange={(val) => handleDateChange('checkOut', val)}
            slotProps={{ textField: { size: 'small', sx: { flexGrow: 1 } } }}
          />
          <TextField
            select
            label="Guests"
            value={bookingState.guestCount}
            onChange={handleGuestChange}
            size="small"
            sx={{ minWidth: 100 }}
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <MenuItem key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* --- ACCORDION: ADVANCED FILTERS --- */}
        <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <FilterListIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Advanced Filters & Gaming Gear</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            
            {/* FIXED GRID SYNTAX HERE */}
            <Grid container spacing={3}>
              
              {/* 1. ROOM DETAILS */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Room Details</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                   <TextField label="Min Price" size="small" type="number" 
                      value={bookingState.filters.minPrice ?? ''} 
                      onChange={(e) => handleFilterChange('minPrice', toNumberOrNull(e.target.value))} 
                   />
                   <TextField label="Max Price" size="small" type="number" 
                      value={bookingState.filters.maxPrice ?? ''} 
                      onChange={(e) => handleFilterChange('maxPrice', toNumberOrNull(e.target.value))} 
                   />
                </Box>
                <TextField select label="Room Type" size="small" fullWidth sx={{ mb: 2 }}
                    value={bookingState.filters.roomType ?? ''}
                    onChange={(e) => handleFilterChange('roomType', e.target.value === '' ? null : e.target.value)}
                >
                    <MenuItem value="">Any</MenuItem>
                    {ROOM_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </TextField>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField label="Min Beds" size="small" type="number" fullWidth
                      value={bookingState.filters.minBeds ?? ''} 
                      onChange={(e) => handleFilterChange('minBeds', toNumberOrNull(e.target.value))} 
                    />
                    <TextField label="Bedrooms" size="small" type="number" fullWidth
                      value={bookingState.filters.minBedrooms ?? ''} 
                      onChange={(e) => handleFilterChange('minBedrooms', toNumberOrNull(e.target.value))} 
                    />
                </Box>
              </Grid>

              {/* 2. AMENITIES */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Amenities</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel control={
                    <Checkbox checked={!!bookingState.filters.accessible} 
                      onChange={(e) => handleFilterChange('accessible', e.target.checked ? true : null)} />
                  } label="Accessible" />
                  <FormControlLabel control={
                    <Checkbox checked={!!bookingState.filters.petFriendly} 
                      onChange={(e) => handleFilterChange('petFriendly', e.target.checked ? true : null)} />
                  } label="Pet Friendly" />
                  <FormControlLabel control={
                    <Checkbox checked={!!bookingState.filters.nonSmoking} 
                      onChange={(e) => handleFilterChange('nonSmoking', e.target.checked ? true : null)} />
                  } label="Non-Smoking" />
                  <FormControlLabel control={
                    <Checkbox checked={!!bookingState.filters.hasJacuzzi} 
                      onChange={(e) => handleFilterChange('hasJacuzzi', e.target.checked ? true : null)} />
                  } label="Jacuzzi" />
                </Box>
              </Grid>

              {/* 3. GAMING GEAR */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" gutterBottom color="secondary">Gaming Setup</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField label="# of PCs" size="small" type="number" sx={{ width: '40%' }}
                        value={bookingState.gamingPreferences.pcCount ?? ''} 
                        onChange={(e) => handleGamingChange('pcCount', toNumberOrNull(e.target.value))}
                    />
                     <TextField select label="PC Tier" size="small" sx={{ width: '60%' }}
                        value={bookingState.gamingPreferences.pcTier ?? ''} 
                        onChange={(e) => handleGamingChange('pcTier', e.target.value === '' ? null : e.target.value)}
                     >
                        <MenuItem value="">Any</MenuItem>
                        {PC_TIER_OPTIONS.map(tier => <MenuItem key={tier} value={tier}>{tier}</MenuItem>)}
                     </TextField>
                </Box>
                
                <FormControl fullWidth size="small">
                  <InputLabel>Consoles</InputLabel>
                  <Select
                    multiple
                    value={bookingState.gamingPreferences.consoles || []}
                    onChange={(e) => handleGamingChange('consoles', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    input={<OutlinedInput label="Consoles" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {CONSOLE_OPTIONS.map((console) => (
                      <MenuItem key={console} value={console}>
                        {console}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={handleClear} color="secondary" size="small" variant="contained" >Clear Filters</Button>
            </Box>
          </AccordionDetails>
        </Accordion>

      </Paper>
    </LocalizationProvider>
  );
}