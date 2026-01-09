package com.skillstorm.hotelreservationsystem.services;

import com.skillstorm.hotelreservationsystem.dto.ReservationRequest;
import com.skillstorm.hotelreservationsystem.models.*;
import com.skillstorm.hotelreservationsystem.repositories.*;
import com.stripe.model.Refund;
import com.stripe.param.RefundCreateParams;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final EmailService emailService;

    public ReservationService(ReservationRepository reservationRepository, RoomRepository roomRepository, UserRepository userRepository, RoomTypeRepository roomTypeRepository, EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.emailService = emailService;
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

        //  CALCULATE TOTAL PRICE 
        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        
        double totalPrice = type.getPricePerNight() * nights;

        // 3. Create Reservation (Using STRING IDs)
        Reservation reservation = new Reservation(
                user.getId(),
                room.getId(),
                request.getCheckIn(),
                request.getCheckOut(),
                request.getGuestCount(),
                totalPrice, // Use price from loaded type
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

        try {
            emailService.sendReservationConfirmation(userEmail, savedReservation);
        } catch (Exception e) {
            // Log error but don't fail the reservation just because email failed
            System.err.println("Failed to send email: " + e.getMessage());
        }

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
                if (room.getRoomTypeId() != null) {
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

        if (r.getStatus() == Reservation.ReservationStatus.CONFIRMED) {
            
            // 1. Calculate time until Check-in
            long hoursUntilCheckIn = ChronoUnit.HOURS.between(
                    LocalDateTime.now(), 
                    r.getCheckIn().atStartOfDay()
            );

            // 2. 72-Hour Rule Check
            if (hoursUntilCheckIn >= 72) {
                
                String pid = r.getPaymentIntentId();

                if (pid != null && pid.startsWith("pi_test")) {
                    // Skip Stripe, just update DB
                    System.out.println("Test Reservation Canceled. Skipping Stripe Refund for: " + pid);
                    r.setStatus(Reservation.ReservationStatus.REFUNDED);
                } 
                // --- REAL STRIPE REFUND ---
                else if (pid != null && !pid.isEmpty()) {
                    try {
                        RefundCreateParams params = RefundCreateParams.builder()
                                .setPaymentIntent(pid)
                                .build();
                        
                        Refund refund = Refund.create(params);
                        System.out.println("Stripe Refund Successful: " + refund.getId());
                        r.setStatus(Reservation.ReservationStatus.REFUNDED);
                        
                    } catch (Exception e) {
                        e.printStackTrace();
                        throw new RuntimeException("Failed to process Stripe refund: " + e.getMessage());
                    }
                } 
                else {
                    // No Payment ID found? Just mark as Refunded/Cancelled
                    r.setStatus(Reservation.ReservationStatus.REFUNDED);
                }

            } else {
                // Less than 72 hours = No Refund
                r.setStatus(Reservation.ReservationStatus.CANCELLED);
            }

            // 3. Free up the Room Dates
            Room room = roomRepository.findById(r.getRoomId()).orElseThrow();
            if (room.getUnavailableDates() != null) {
                room.getUnavailableDates().removeIf(date -> 
                    date.getStart().equals(r.getCheckIn()) && date.getEnd().equals(r.getCheckOut())
                );
            }
            
            roomRepository.save(room);
            reservationRepository.save(r);

            try {
                // Ensure User is attached so we can get the email/name
                User user = userRepository.findById(r.getUserId()).orElse(null);
                if (user != null) {
                    r.setUser(user);
                    r.setRoom(room); // Ensure room is attached for the email body
                    emailService.sendCancellationConfirmation(user.getEmail(), r);
                }
            } catch (Exception e) {
                System.err.println("Failed to send cancellation email: " + e.getMessage());
            }
        }
    }

    // 3. EDIT RESERVATION
    @Transactional
    public Reservation updateReservation(String reservationId, ReservationRequest request) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        // 1. Check what actually changed
        boolean datesChanged = !r.getCheckIn().equals(request.getCheckIn()) || !r.getCheckOut().equals(request.getCheckOut());
        boolean roomChanged = !r.getRoomId().equals(request.getRoomId()); // <--- CRITICAL: Detect Room Change

        if (datesChanged || roomChanged) {
            
            // A. RELEASE THE OLD ROOM (Clear its calendar)
            Room oldRoom = roomRepository.findById(r.getRoomId()).orElseThrow();
            if (oldRoom.getUnavailableDates() != null) {
                // Remove the specific date range for this reservation
                oldRoom.getUnavailableDates().removeIf(date -> 
                    date.getStart().equals(r.getCheckIn()) && date.getEnd().equals(r.getCheckOut())
                );
            }
            roomRepository.save(oldRoom); // Save the "freed up" old room

            // B. PREPARE THE NEW ROOM
            // If roomChanged is true, fetch the NEW ID. If not, re-fetch the OLD ID (which we just cleared).
            Room targetRoom = roomChanged ? 
                    roomRepository.findById(request.getRoomId()).orElseThrow(() -> new RuntimeException("New Room not found")) 
                    : oldRoom;

            // C. CHECK AVAILABILITY ON TARGET ROOM
            // We check if the target room has ANY overlap with the requested dates
            boolean isAvailable = true;
            if (targetRoom.getUnavailableDates() != null) {
                for (Room.UnavailableDate date : targetRoom.getUnavailableDates()) {
                    // Standard Overlap Logic: (StartA < EndB) and (EndA > StartB)
                    if (request.getCheckIn().isBefore(date.getEnd()) && request.getCheckOut().isAfter(date.getStart())) {
                        isAvailable = false;
                        break;
                    }
                }
            }

            if (!isAvailable) {
                // Throwing this RuntimeException triggers @Transactional rollback 
                // (The old room dates will automatically be restored by the DB rollback)
                throw new RuntimeException("The selected room is not available for these dates.");
            }

            // D. BOOK THE TARGET ROOM
            if (targetRoom.getUnavailableDates() == null) targetRoom.setUnavailableDates(new ArrayList<>());
            targetRoom.getUnavailableDates().add(new Room.UnavailableDate(request.getCheckIn(), request.getCheckOut()));
            roomRepository.save(targetRoom);

            // E. UPDATE RESERVATION DETAILS
            r.setRoomId(targetRoom.getId()); // <--- CRITICAL: Update the ID
            r.setCheckIn(request.getCheckIn());
            r.setCheckOut(request.getCheckOut());

            // F. RECALCULATE PRICE
            // We must fetch the type of the TARGET room to get the correct price
            RoomType type = roomTypeRepository.findById(targetRoom.getRoomTypeId()).orElseThrow();
            long nights = java.time.temporal.ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
            if (nights < 1) nights = 1;
            
            r.setTotalPrice(type.getPricePerNight() * nights);
        }

        // 2. Update Guest Count (Always)
        r.setGuestCount(request.getGuestCount());

        Reservation savedReservation = reservationRepository.save(r);

        // 3. Send Email
        try {
            User user = userRepository.findById(r.getUserId()).orElseThrow();
            r.setUser(user);
            
            // Hydrate room details for the email
            Room currentRoom = roomRepository.findById(r.getRoomId()).orElseThrow();
            if (currentRoom.getRoomType() == null) {
                RoomType type = roomTypeRepository.findById(currentRoom.getRoomTypeId()).orElse(null);
                currentRoom.setRoomType(type);
            }
            r.setRoom(currentRoom);

            emailService.sendUpdateConfirmation(user.getEmail(), r);
        } catch (Exception e) {
            System.err.println("Failed to send update email: " + e.getMessage());
        }

        return savedReservation;
    }
}