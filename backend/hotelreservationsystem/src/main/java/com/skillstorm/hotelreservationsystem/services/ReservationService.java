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

    public ReservationService(ReservationRepository reservationRepository, RoomRepository roomRepository, UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Reservation createReservation(ReservationRequest request, String userEmail) {
        // 1. Find the Room
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // 2. Find the User (from the logged-in session)
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Create the Reservation
        Reservation reservation = new Reservation(
                user,
                room,
                request.getCheckIn(),
                request.getCheckOut(),
                request.getGuestCount(),
                // Calculate price again server-side for security, or pass it in
                room.getRoomTypeId().getPricePerNight(), 
                Reservation.ReservationStatus.CONFIRMED,
                request.getPaymentIntentId()
        );
        
        Reservation savedReservation = reservationRepository.save(reservation);

        // 4. BLOCK THE DATES on the Room
        if (room.getUnavailableDates() == null) {
            room.setUnavailableDates(new ArrayList<>());
        }
        room.getUnavailableDates().add(new Room.UnavailableDate(request.getCheckIn(), request.getCheckOut()));
        roomRepository.save(room);

        // 5. Update User's Stripe ID (Simplistic approach)
        // In a real app, you'd extract this 'cus_...' ID from the Stripe PaymentIntent object
        if (user.getStripeCustomerId() == null) {
             // For now, we just placeholder this logic. 
             // To do this for real, we need to ask Stripe "Who is the customer for this Intent?"
             // user.setStripeCustomerId(stripeCustomerIdFromIntent);
             // userRepository.save(user);
        }

        return savedReservation;
    }
}