package com.skillstorm.hotelreservationsystem.services;

import com.skillstorm.hotelreservationsystem.dto.ReservationRequest;
import com.skillstorm.hotelreservationsystem.models.*;
import com.skillstorm.hotelreservationsystem.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomTypeRepository roomTypeRepository;

    public ReservationService(ReservationRepository reservationRepository, RoomRepository roomRepository, UserRepository userRepository, RoomTypeRepository roomTypeRepository) {
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    @Transactional
    public Reservation createReservation(ReservationRequest request, String userEmail) {

        // 1. Fetch Entities
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Fetch Price (Need to load RoomType manualy now!)
        RoomType type = roomTypeRepository.findById(room.getRoomTypeId())
                .orElseThrow(() -> new RuntimeException("Room Type not found"));
        room.setRoomType(type); // Attach for consistency

        // 3. Create Reservation (Using STRING IDs)
        Reservation reservation = new Reservation(
                user.getId(),
                room.getId(),
                request.getCheckIn(),
                request.getCheckOut(),
                request.getGuestCount(),
                type.getPricePerNight(), // Use price from loaded type
                Reservation.ReservationStatus.CONFIRMED,
                request.getPaymentIntentId()
        );
        
        // 4. Save to DB (Saves "userId": "..." and "roomId": "...")
        Reservation savedReservation = reservationRepository.save(reservation);

        // 5. CRITICAL: Attach Objects for Frontend
        // This ensures the returned JSON has "user": {...} and "room": {...}
        savedReservation.setUser(user);
        savedReservation.setRoom(room);

        // 6. Update Room Dates
        if (room.getUnavailableDates() == null) {
            room.setUnavailableDates(new ArrayList<>());
        }
        room.getUnavailableDates().add(new Room.UnavailableDate(request.getCheckIn(), request.getCheckOut()));
        roomRepository.save(room);

        return savedReservation;
    }

    public List<Reservation> getReservationsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find all reservations for this user ID
        List<Reservation> reservations = reservationRepository.findByUserId(user.getId());

        // CRITICAL: Manually populate the Transient objects for the Frontend
        for (Reservation r : reservations) {
            // Attach User
            r.setUser(user);

            // Attach Room & RoomType
            Room room = roomRepository.findById(r.getRoomId()).orElse(null);
            if (room != null) {
                // We need the RoomType for the name/image/price
                if (room.getRoomType() != null) {
                    RoomType type = roomTypeRepository.findById(room.getRoomTypeId()).orElse(null);
                    room.setRoomType(type);
                }
                r.setRoom(room);
            }
        }
        return reservations;
    }

    // 2. CANCEL RESERVATION
    @Transactional
    public void cancelReservation(String reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        // Only cancel if not already cancelled
        if (r.getStatus() != Reservation.ReservationStatus.CANCELLED) {
            
            // 1. Update Status
            r.setStatus(Reservation.ReservationStatus.CANCELLED);
            
            // 2. Free up the Room Dates
            Room room = roomRepository.findById(r.getRoomId()).orElseThrow();
            
            // Remove the specific date range from the room's unavailable list
            if (room.getUnavailableDates() != null) {
                room.getUnavailableDates().removeIf(date -> 
                    date.getStart().equals(r.getCheckIn()) && date.getEnd().equals(r.getCheckOut())
                );
            }
            
            roomRepository.save(room);
            reservationRepository.save(r);
        }
    }

    // 3. EDIT RESERVATION
    @Transactional
    public Reservation updateReservation(String reservationId, ReservationRequest request) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        Room room = roomRepository.findById(r.getRoomId()).orElseThrow();

        // A. Handle Date Changes
        if (!r.getCheckIn().equals(request.getCheckIn()) || !r.getCheckOut().equals(request.getCheckOut())) {
            
            // 1. Remove OLD dates temporarily
            room.getUnavailableDates().removeIf(date -> 
                date.getStart().equals(r.getCheckIn()) && date.getEnd().equals(r.getCheckOut())
            );

            // 2. Check if NEW dates are available
            boolean isAvailable = roomRepository.findAvailableRooms(request.getCheckIn(), request.getCheckOut())
                    .stream().anyMatch(availableRoom -> availableRoom.getId().equals(room.getId()));

            if (!isAvailable) {
                // Revert: Put the old dates back if new ones fail!
                room.getUnavailableDates().add(new Room.UnavailableDate(r.getCheckIn(), r.getCheckOut()));
                roomRepository.save(room);
                throw new RuntimeException("New dates are not available.");
            }

            // 3. Success: Set new dates
            r.setCheckIn(request.getCheckIn());
            r.setCheckOut(request.getCheckOut());
            
            // 4. Update Price (Recalculate based on new nights)
            RoomType type = roomTypeRepository.findById(room.getRoomTypeId()).orElseThrow();
            long nights = java.time.temporal.ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
            r.setTotalPrice(type.getPricePerNight() * nights); // Simple price update

            // 5. Block NEW dates
            room.getUnavailableDates().add(new Room.UnavailableDate(request.getCheckIn(), request.getCheckOut()));
            roomRepository.save(room);
        }

        // B. Update Guest Count
        r.setGuestCount(request.getGuestCount());

        return reservationRepository.save(r);
    }
}