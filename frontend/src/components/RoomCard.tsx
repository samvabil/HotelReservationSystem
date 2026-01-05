import { 
  Card, CardMedia, CardContent, Typography, Box, 
  Chip, Button, Divider, Stack 
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import KitchenIcon from '@mui/icons-material/Kitchen';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ComputerIcon from '@mui/icons-material/Computer';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { type RoomType } from '../types/RoomType';

interface RoomCardProps {
  roomType: RoomType;
  onBook: (roomTypeId: string) => void;
}

export default function RoomCard({ roomType, onBook }: RoomCardProps) {
  // Use the first image in the list, or a placeholder
  const mainImage = roomType.images && roomType.images.length > 0 
    ? roomType.images[0] 
    : "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <Card elevation={4} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mb: 3, borderRadius: 2, overflow: 'hidden', border: '2px solid',
        borderColor: 'primary.main' }}>
      
      {/* 1. LEFT: IMAGE */}
      <CardMedia
        component="img"
        sx={{ width: { xs: '100%', md: '35%' }, height: { xs: 200, md: 'auto' }, objectFit: 'cover' }}
        image={mainImage}
        alt={roomType.name}
      />

      {/* 2. MIDDLE: DETAILS */}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {roomType.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
               {roomType.numBeedroom} Bedroom • {roomType.numBeds} {roomType.typeBed} Bed{roomType.numBeds > 1 ? 's' : ''} • {roomType.capacity} Guests
            </Typography>
          </Box>
          <Chip 
            label={`$${roomType.pricePerNight} / night`} 
            color="secondary" 
            sx={{ fontWeight: 'bold', fontSize: '1rem' }} 
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Specs & Amenities */}
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }} useFlexGap>
          <Chip icon={<SquareFootIcon />} label={`${roomType.squareFeet} sq ft`} size="small" variant="outlined" />
          {roomType.hasJacuzzi && <Chip icon={<HotelIcon />} label="Jacuzzi" size="small" variant="outlined" />}
          {roomType.hasKitchen && <Chip icon={<KitchenIcon />} label="Kitchen" size="small" variant="outlined" />}
        </Stack>

        {/* GAMING SETUP */}
        <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1, border: '1px dashed grey', mt: 'auto' }}>
          <Typography variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SportsEsportsIcon fontSize="small" /> Gaming Station
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
            {roomType.numPcs > 0 && (
               <Chip 
                 icon={<ComputerIcon />} 
                 label={`${roomType.numPcs}x Lvl ${roomType.levelOfPc} PC`} 
                 size="small" 
                 color="primary" 
               />
            )}
            {roomType.consoles.map(console => (
              <Chip key={console} label={console} size="small" sx={{ bgcolor: 'background.paper' }} />
            ))}
          </Stack>
        </Box>

      </CardContent>

      {/* 3. RIGHT: ACTION BUTTON */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, borderLeft: { md: '1px solid #e0e0e0' } }}>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => onBook(roomType.id)}
          sx={{ minWidth: 150, height: 50, fontWeight: 'bold' }}
        >
          Book a stay!
        </Button>
      </Box>

    </Card>
  );
}