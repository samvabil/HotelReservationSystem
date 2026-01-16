import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Tooltip,
  Divider,
  Box,
  DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessibleIcon from '@mui/icons-material/Accessible';
import PetsIcon from '@mui/icons-material/Pets';
import SmokeFreeIcon from '@mui/icons-material/SmokeFree';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import HotTubIcon from '@mui/icons-material/HotTub';
import { useNavigate } from 'react-router-dom';

import { type Room } from '../types/Room';

/**
 * Props for the RoomSelectionModal component.
 */
interface RoomSelectionModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Callback function invoked when the modal should be closed. */
  onClose: () => void;
  /** The name of the room type being displayed. */
  roomTypeName: string;
  /** The price per night for this room type. */
  price: number;
  /** List of available rooms of this type for the selected dates. */
  availableRooms: Room[];
}

/**
 * Modal component for selecting a specific room from available rooms.
 * <p>
 * Displays a list of available rooms for a selected room type and date range.
 * Each room shows its room number and features (accessible, pet-friendly, smoking status, jacuzzi).
 * Users can click "Book" on a specific room to proceed to checkout.
 * </p>
 *
 * @param {RoomSelectionModalProps} props - Component props.
 * @returns {JSX.Element} A Material-UI Dialog showing available rooms.
 */
export default function RoomSelectionModal({
  open,
  onClose,
  roomTypeName,
  price,
  availableRooms
}: RoomSelectionModalProps) {

  const navigate = useNavigate();

  const handleBookClick = (roomId: string) => {
    navigate(`/checkout/${roomId}`);
  };

  // Helper to render feature icons
  const renderFeatures = (room: Room) => (
    <Stack direction="row" spacing={1} sx={{ color: 'text.secondary' }}>
      
      {/* Accessible */}
      {room.accessible && (
        <Tooltip title="Wheelchair Accessible">
          <AccessibleIcon fontSize="small" />
        </Tooltip>
      )}

      {/* Pet Friendly */}
      {room.petFriendly && (
        <Tooltip title="Pet Friendly">
          <PetsIcon fontSize="small" />
        </Tooltip>
      )}

      {/* Smoking / Non-Smoking Logic */}
      {room.nonSmoking ? (
        <Tooltip title="Non-Smoking">
          <SmokeFreeIcon fontSize="small" />
        </Tooltip>
      ) : (
        <Tooltip title="Smoking Allowed">
          <SmokingRoomsIcon fontSize="small" color="action" />
        </Tooltip>
      )}

      {/* Jacuzzi Logic */}
      {room.roomTypeId.hasJacuzzi && (
        <Tooltip title="Jacuzzi Tub">
          <HotTubIcon fontSize="small" />
        </Tooltip>
      )}
    </Stack>
  );

  return (
    <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }} 
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
            <Typography variant="h6" component="div">
            Available {roomTypeName}s
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Select a specific room number
            </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {availableRooms.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">No rooms of this type available for these dates.</Typography>
            </Box>
        ) : (
            <List sx={{ width: '100%' }}>
            {availableRooms.map((room) => (
                <React.Fragment key={room.id}>
                <ListItem
                    alignItems="center"
                    secondaryAction={
                    <Button 
                        variant="contained" 
                        color="primary"
                        disableElevation
                        // 3. Removed 'Number()' cast since your ID is likely a string in the DB
                        onClick={() => handleBookClick(room.id)}
                    >
                        Book
                    </Button>
                    }
                >
                    <ListItemText
                    primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                        Room {room.roomNumber}
                        </Typography>
                    }
                    secondary={
                        <Box sx={{ mt: 0.5 }}>
                            {renderFeatures(room)}
                        </Box>
                    }
                    />
                </ListItem>
                <Divider component="li" />
                </React.Fragment>
            ))}
            </List>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between', bgcolor: 'background.default' }}>
          <Typography variant="body2" sx={{ ml: 1 }}>
              Price per night: <b>${price.toFixed(2)}</b>
          </Typography>
          <Button onClick={onClose} color="inherit">
              Cancel
          </Button>
      </DialogActions>
    </Dialog>
  );
}