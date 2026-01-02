import { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Paper, MenuItem, Grid, 
  Accordion, AccordionSummary, AccordionDetails, 
  Typography, FormControlLabel, Checkbox, Slider, Chip, 
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
  setFilters, 
  setGamingPreferences, 
  clearBookingState 
} from '../store/bookingSlice';

// Options for dropdowns
const CONSOLE_OPTIONS = ["PS5", "Xbox Series X", "Nintendo Switch", "Retro Arcade"];
const PC_TIER_OPTIONS = ["Standard", "High-End", "God-Tier"];
const ROOM_TYPES = ["Standard", "Suite", "Penthouse", "Gaming Bunker"];

export default function SearchRoomsBar({ onSearch }: { onSearch: () => void }) {
  const dispatch = useDispatch();
  
  // 1. Read Global State from Redux (Persistence)
  const bookingState = useSelector((state: RootState) => state.booking);

  // 2. Local State for Form Inputs (Prevents laggy typing)
  // We initialize these from Redux so data persists on reload
  const [dates, setDates] = useState({
    checkIn: bookingState.checkInDate ? dayjs(bookingState.checkInDate) : null,
    checkOut: bookingState.checkOutDate ? dayjs(bookingState.checkOutDate) : null,
  });
  const [guests, setGuests] = useState(bookingState.guestCount);

  // Filters State
  const [filters, setLocalFilters] = useState({
    minPrice: bookingState.filters.minPrice ?? '', // Use '' for inputs
    maxPrice: bookingState.filters.maxPrice ?? '',
    roomType: bookingState.filters.roomType ?? '',
    minBeds: bookingState.filters.minBeds ?? '',
    minBedrooms: bookingState.filters.minBedrooms ?? '',
    accessible: bookingState.filters.accessible ?? false,
    petFriendly: bookingState.filters.petFriendly ?? false,
    nonSmoking: bookingState.filters.nonSmoking ?? false,
    hasJacuzzi: bookingState.filters.hasJacuzzi ?? false,
  });

  // Gaming State
  const [gaming, setGaming] = useState({
    pcCount: bookingState.gamingPreferences.pcCount ?? '',
    pcTier: bookingState.gamingPreferences.pcTier ?? '',
    consoles: bookingState.gamingPreferences.consoles,
  });

  // 3. Handlers
  const handleSearch = () => {
    // A. Dispatch Core Data
    if (dates.checkIn && dates.checkOut) {
      dispatch(setDatesAndGuests({
        checkIn: dates.checkIn.toISOString(),
        checkOut: dates.checkOut.toISOString(),
        guests: guests
      }));
    }

    // B. Dispatch Filters (Convert '' back to null)
    dispatch(setFilters({
      minPrice: filters.minPrice === '' ? null : Number(filters.minPrice),
      maxPrice: filters.maxPrice === '' ? null : Number(filters.maxPrice),
      roomType: filters.roomType === '' ? null : filters.roomType as string,
      minBeds: filters.minBeds === '' ? null : Number(filters.minBeds),
      minBedrooms: filters.minBedrooms === '' ? null : Number(filters.minBedrooms),
      // Booleans: If true -> true. If false -> null (don't care)
      accessible: filters.accessible ? true : null,
      petFriendly: filters.petFriendly ? true : null,
      nonSmoking: filters.nonSmoking ? true : null,
      hasJacuzzi: filters.hasJacuzzi ? true : null,
    }));

    // C. Dispatch Gaming
    dispatch(setGamingPreferences({
      pcCount: gaming.pcCount === '' ? null : Number(gaming.pcCount),
      pcTier: gaming.pcTier === '' ? null : gaming.pcTier as string,
      consoles: gaming.consoles
    }));

    // D. Trigger Parent
    onSearch();
  };

  const handleClear = () => {
    dispatch(clearBookingState());
    // Reset local state manually since we aren't listening to Redux changes continuously
    setDates({ checkIn: null, checkOut: null });
    setGuests(2);
    setLocalFilters({
      minPrice: '', maxPrice: '', roomType: '', minBeds: '', minBedrooms: '',
      accessible: false, petFriendly: false, nonSmoking: false, hasJacuzzi: false
    });
    setGaming({ pcCount: '', pcTier: '', consoles: [] });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        
        {/* --- TOP ROW: DATES & GUESTS --- */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <DatePicker
            label="Check-in"
            value={dates.checkIn}
            onChange={(val) => setDates({ ...dates, checkIn: val })}
            disablePast
            slotProps={{ textField: { size: 'small', sx: { flexGrow: 1 } } }}
          />
          <DatePicker
            label="Check-out"
            value={dates.checkOut}
            minDate={dates.checkIn ? dates.checkIn.add(1, 'day') : undefined}
            onChange={(val) => setDates({ ...dates, checkOut: val })}
            slotProps={{ textField: { size: 'small', sx: { flexGrow: 1 } } }}
          />
          <TextField
            select
            label="Guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            size="small"
            sx={{ minWidth: 100 }}
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <MenuItem key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</MenuItem>
            ))}
          </TextField>

          <Button 
            variant="contained" 
            size="large" 
            onClick={handleSearch}
            color="secondary"
            sx={{ flexGrow: 0, px: 4 }}
          >
            Search
          </Button>
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
            <Grid container spacing={3}>
              
              {/* 1. ROOM DETAILS */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Room Details</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                   <TextField label="Min Price" size="small" type="number" 
                      value={filters.minPrice} onChange={(e) => setLocalFilters({...filters, minPrice: e.target.value})} 
                   />
                   <TextField label="Max Price" size="small" type="number" 
                      value={filters.maxPrice} onChange={(e) => setLocalFilters({...filters, maxPrice: e.target.value})} 
                   />
                </Box>
                <TextField select label="Room Type" size="small" fullWidth sx={{ mb: 2 }}
                    value={filters.roomType} onChange={(e) => setLocalFilters({...filters, roomType: e.target.value})}
                >
                    <MenuItem value="">Any</MenuItem>
                    {ROOM_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </TextField>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField label="Min Beds" size="small" type="number" fullWidth
                      value={filters.minBeds} onChange={(e) => setLocalFilters({...filters, minBeds: e.target.value})} 
                    />
                    <TextField label="Bedrooms" size="small" type="number" fullWidth
                      value={filters.minBedrooms} onChange={(e) => setLocalFilters({...filters, minBedrooms: e.target.value})} 
                    />
                </Box>
              </Grid>

              {/* 2. AMENITIES */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Amenities</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel control={
                    <Checkbox checked={!!filters.accessible} onChange={(e) => setLocalFilters({...filters, accessible: e.target.checked})} />
                  } label="Accessible" />
                  <FormControlLabel control={
                    <Checkbox checked={!!filters.petFriendly} onChange={(e) => setLocalFilters({...filters, petFriendly: e.target.checked})} />
                  } label="Pet Friendly" />
                  <FormControlLabel control={
                    <Checkbox checked={!!filters.nonSmoking} onChange={(e) => setLocalFilters({...filters, nonSmoking: e.target.checked})} />
                  } label="Non-Smoking" />
                  <FormControlLabel control={
                    <Checkbox checked={!!filters.hasJacuzzi} onChange={(e) => setLocalFilters({...filters, hasJacuzzi: e.target.checked})} />
                  } label="Jacuzzi" />
                </Box>
              </Grid>

              {/* 3. GAMING GEAR */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" gutterBottom color="secondary">Gaming Setup</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField label="# of PCs" size="small" type="number" sx={{ width: '40%' }}
                        value={gaming.pcCount} onChange={(e) => setGaming({...gaming, pcCount: e.target.value})}
                    />
                     <TextField select label="PC Tier" size="small" sx={{ width: '60%' }}
                        value={gaming.pcTier} onChange={(e) => setGaming({...gaming, pcTier: e.target.value})}
                     >
                        <MenuItem value="">Any</MenuItem>
                        {PC_TIER_OPTIONS.map(tier => <MenuItem key={tier} value={tier}>{tier}</MenuItem>)}
                     </TextField>
                </Box>
                
                <FormControl fullWidth size="small">
                  <InputLabel>Consoles</InputLabel>
                  <Select
                    multiple
                    value={gaming.consoles}
                    onChange={(e) => setGaming({...gaming, consoles: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
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
                <Button onClick={handleClear} color="inherit" size="small">Clear Filters</Button>
            </Box>
          </AccordionDetails>
        </Accordion>

      </Paper>
    </LocalizationProvider>
  );
}