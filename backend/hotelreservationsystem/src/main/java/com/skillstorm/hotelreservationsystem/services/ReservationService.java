package com.skillstorm.hotelreservationsystem.services;

import com.skillstorm.hotelreservationsystem.dto.ReservationRequest;
import com.skillstorm.hotelreservationsystem.models.*;
import com.skillstorm.hotelreservationsystem.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

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
}