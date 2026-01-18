package com.skillstorm.hotelreservationsystem.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillstorm.hotelreservationsystem.dto.ReservationRequest;
import com.skillstorm.hotelreservationsystem.models.Reservation;
import com.skillstorm.hotelreservationsystem.models.Room;
import com.skillstorm.hotelreservationsystem.models.RoomType;
import com.skillstorm.hotelreservationsystem.models.User;
import com.skillstorm.hotelreservationsystem.repositories.ReservationRepository;
import com.skillstorm.hotelreservationsystem.repositories.RoomRepository;
import com.skillstorm.hotelreservationsystem.repositories.RoomTypeRepository;
import com.skillstorm.hotelreservationsystem.repositories.UserRepository;
import com.stripe.model.Refund;
import com.stripe.param.RefundCreateParams;

/**
 * Service class for managing reservation operations.
 * <p>
 * This service handles business logic for creating, updating, canceling, and retrieving
 * reservations. It coordinates between repositories, manages room availability, processes
 * payments via Stripe, and sends confirmation emails.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final EmailService emailService;

    /**
     * Constructs a new ReservationService with the required repositories and services.
     *
     * @param reservationRepository The repository for reservation data access.
     * @param roomRepository The repository for room data access.
     * @param userRepository The repository for user data access.
     * @param roomTypeRepository The repository for room type data access.
     * @param emailService The service for sending email notifications.
     */
    public ReservationService(ReservationRepository reservationRepository, RoomRepository roomRepository, UserRepository userRepository, RoomTypeRepository roomTypeRepository, EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.emailService = emailService;
    }

    /**
     * Creates a new reservation for the specified user.
     * <p>
     * This method validates the room availability, calculates the total price based on
     * the number of nights and room type pricing, creates a payment transaction record,
     * blocks the room dates, and sends a confirmation email.
     * </p>
     *
     * @param request The reservation request containing room, dates, guest count, and payment details.
     * @param userEmail The email address of the user making the reservation.
     * @return The created reservation with all associated data populated.
     * @throws RuntimeException if the room, user, or room type is not found.
     */
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

        // Calculate amount in cents for payment snapshot
        long amountCents = BigDecimal.valueOf(totalPrice)
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

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

        // Payment snapshot
        reservation.setPaymentStatus(Reservation.PaymentStatus.PAID);
        Reservation.PaymentTransaction txn = new Reservation.PaymentTransaction();
        txn.setProvider("STRIPE");
        txn.setTransactionId(request.getPaymentIntentId());
        txn.setAmountCents(amountCents);
        txn.setCurrency("usd");
        txn.setStatus("SUCCEEDED");
        txn.setPaidAt(Instant.now());
        reservation.setTransaction(txn);
        
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

    /**
     * Retrieves all reservations for a specific user by their email address.
     * <p>
     * This method fetches all reservations belonging to the user and populates
     * the transient User and Room objects for frontend display.
     * </p>
     *
     * @param email The email address of the user.
     * @return A list of reservations for the specified user.
     * @throws RuntimeException if the user is not found.
     */
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

    /**
     * Cancels a reservation and processes refunds if applicable.
     * <p>
     * This method implements the cancellation policy:
     * - Reservations cancelled 72+ hours before check-in are fully refunded
     * - Reservations cancelled less than 72 hours before check-in are not refunded
     * - Room dates are freed up for future bookings
     * - Cancellation confirmation emails are sent
     * </p>
     *
     * @param reservationId The unique identifier of the reservation to cancel.
     * @throws RuntimeException if the reservation or room is not found, or if refund processing fails.
     */
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
                    r.setPaymentStatus(Reservation.PaymentStatus.REFUNDED);
                    if (r.getTransaction() != null) {
                        r.getTransaction().setStatus("REFUNDED");
                        r.getTransaction().setRefundedAt(Instant.now());
                    }
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
                        r.setPaymentStatus(Reservation.PaymentStatus.REFUNDED);
                        if (r.getTransaction() != null) {
                            r.getTransaction().setStatus("REFUNDED");
                            r.getTransaction().setRefundedAt(Instant.now());
                            r.getTransaction().setRefundId(refund.getId());
                        }
                        
                    } catch (Exception e) {
                        e.printStackTrace();
                        throw new RuntimeException("Failed to process Stripe refund: " + e.getMessage());
                    }
                } 
                else {
                    // No Payment ID found? Just mark as Refunded/Cancelled
                    r.setStatus(Reservation.ReservationStatus.REFUNDED);
                    r.setPaymentStatus(Reservation.PaymentStatus.REFUNDED);
                }

            } else {
                // Less than 72 hours = No Refund
                // Keep paymentStatus as PAID since the money is retained
                r.setStatus(Reservation.ReservationStatus.CANCELLED);
                // Do NOT change paymentStatus—money stays with us
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

    /**
     * Updates an existing reservation with new details.
     * <p>
     * This method handles complex update scenarios:
     * - Changing dates or room releases old room dates and books new ones
     * - Price changes trigger refunds (for downgrades) or new charges (for upgrades)
     * - Employee requests can waive additional charges for upgrades
     * - Room availability is checked before applying changes
     * </p>
     *
     * @param reservationId The unique identifier of the reservation to update.
     * @param request The updated reservation details.
     * @param empReq Whether this is an employee request (affects payment handling).
     * @return The updated reservation with all associated data populated.
     * @throws RuntimeException if the reservation, room, or room type is not found,
     *                        if the new room is not available, or if payment processing fails.
     */
    @Transactional
    public Reservation updateReservation(String reservationId, ReservationRequest request, boolean empReq) {
        // 1. Fetch Existing Reservation
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        // Snapshot old details for price comparison later
        double oldTotalPrice = r.getTotalPrice();
        String oldPaymentIntentId = r.getPaymentIntentId();
        String oldRoomId = r.getRoomId();

        // 2. Handle Room/Date Changes
        // Check if the dates or room actually changed to avoid unnecessary database work
        boolean datesChanged = !r.getCheckIn().equals(request.getCheckIn()) || !r.getCheckOut().equals(request.getCheckOut());
        boolean roomChanged = !r.getRoomId().equals(request.getRoomId());

        Room targetRoom;

        if (datesChanged || roomChanged) {
            // A. Release the Old Room Dates
            // We must clear the calendar for the old room so that if the user is 
            // just changing dates in the same room, we don't block ourselves.
            Room oldRoom = roomRepository.findById(oldRoomId).orElseThrow();
            if (oldRoom.getUnavailableDates() != null) {
                oldRoom.getUnavailableDates().removeIf(date -> 
                    date.getStart().equals(r.getCheckIn()) && date.getEnd().equals(r.getCheckOut())
                );
            }
            roomRepository.save(oldRoom);

            // B. Determine Target Room
            if (roomChanged) {
                targetRoom = roomRepository.findById(request.getRoomId())
                        .orElseThrow(() -> new RuntimeException("New Room not found"));
            } else {
                // If room didn't change, we are re-booking the old room (which we just cleared dates for)
                targetRoom = oldRoom;
            }

            // C. Check Availability on Target Room
            boolean isAvailable = true;
            if (targetRoom.getUnavailableDates() != null) {
                for (Room.UnavailableDate date : targetRoom.getUnavailableDates()) {
                    // Standard Date Overlap Check
                    if (request.getCheckIn().isBefore(date.getEnd()) && request.getCheckOut().isAfter(date.getStart())) {
                        isAvailable = false;
                        break;
                    }
                }
            }

            if (!isAvailable) {
                // Throwing RuntimeException triggers @Transactional rollback, 
                // restoring the old room's calendar automatically.
                throw new RuntimeException("The selected room is not available for these dates.");
            }

            // D. Book the Target Room
            if (targetRoom.getUnavailableDates() == null) {
                targetRoom.setUnavailableDates(new ArrayList<>());
            }
            targetRoom.getUnavailableDates().add(new Room.UnavailableDate(request.getCheckIn(), request.getCheckOut()));
            roomRepository.save(targetRoom);

            // E. Update Reservation Data
            r.setRoomId(targetRoom.getId());
            r.setCheckIn(request.getCheckIn());
            r.setCheckOut(request.getCheckOut());
            
            // F. Recalculate Total Price
            // Must fetch RoomType to get the correct nightly rate
            RoomType type = roomTypeRepository.findById(targetRoom.getRoomTypeId()).orElseThrow();
            long nights = java.time.temporal.ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
            if (nights < 1) nights = 1;
            
            double newTotalPrice = type.getPricePerNight() * nights;
            r.setTotalPrice(newTotalPrice);
            
        } else {
            // If only guest count changed, we still need the room object for email/return
            targetRoom = roomRepository.findById(r.getRoomId()).orElseThrow();
        }

        // 3. Update Guest Count (Always allow this update)
        r.setGuestCount(request.getGuestCount());

        // 4. Handle Payments (Refunds or Charges)
        long priceDiffCents = Math.round((r.getTotalPrice() - oldTotalPrice) * 100);

        // CASE A: CHEAPER (Downgrade) -> Refund the difference
        // We do this for both Employees AND Guests (returning money is always good)
        if (priceDiffCents < 0) {
            long refundAmount = Math.abs(priceDiffCents);
            try {
                // If it's a real Stripe transaction (not a test seed), process refund
                if (oldPaymentIntentId != null && !oldPaymentIntentId.startsWith("pi_test_seed")) {
                    RefundCreateParams params = RefundCreateParams.builder()
                            .setPaymentIntent(oldPaymentIntentId)
                            .setAmount(refundAmount)
                            .build();
                    Refund refund = Refund.create(params);
                    System.out.println("Partial refund successful: " + refund.getId());
                }
            } catch (Exception e) {
                // Log but don't fail the reservation update if refund fails? 
                // Alternatively, throw exception to rollback everything.
                System.err.println("Failed to process partial refund: " + e.getMessage());
            }
        } 
        // CASE B: MORE EXPENSIVE (Upgrade)
        else if (priceDiffCents > 0) {
            
            if (empReq) {
                // --- EMPLOYEE OVERRIDE ---
                // Do NOT charge the card. Keep the reservation total price updated 
                // (so reports are accurate), but do not process a new Stripe transaction.
                System.out.println("Employee Upgrade: Waiving additional cost of " + priceDiffCents + " cents.");
                
                // Optional: You could add a note to the reservation or transaction log here
                // r.addNote("Upgrade fee waived by employee");
                
            } else {
                // --- GUEST FLOW (Requires Payment) ---
                String newPaymentIntentId = request.getPaymentIntentId();
                
                // If the frontend didn't send a new payment ID, we can't proceed
                if (newPaymentIntentId == null || newPaymentIntentId.isEmpty() || newPaymentIntentId.equals(oldPaymentIntentId)) {
                    throw new RuntimeException("Price increased. New payment required.");
                }

                try {
                    // 1. Refund the OLD transaction entirely (Clean slate)
                    if (oldPaymentIntentId != null && !oldPaymentIntentId.startsWith("pi_test_seed")) {
                        RefundCreateParams params = RefundCreateParams.builder()
                                .setPaymentIntent(oldPaymentIntentId)
                                .build();
                        Refund.create(params);
                    }

                    // 2. Attach the NEW transaction to the reservation
                    r.setPaymentIntentId(newPaymentIntentId);
                    
                    Reservation.PaymentTransaction txn = new Reservation.PaymentTransaction();
                    txn.setProvider("STRIPE");
                    txn.setTransactionId(newPaymentIntentId);
                    txn.setAmountCents(Math.round(r.getTotalPrice() * 100));
                    txn.setCurrency("usd");
                    txn.setStatus("SUCCEEDED");
                    txn.setPaidAt(Instant.now());
                    r.setTransaction(txn);

                } catch (Exception e) {
                    throw new RuntimeException("Failed to swap payment transactions: " + e.getMessage());
                }
            }
        }

        // 5. Save Changes
        Reservation savedReservation = reservationRepository.save(r);

        // 6. Send Confirmation Email
        try {
            User user = userRepository.findById(r.getUserId()).orElseThrow();
            r.setUser(user);
            r.setRoom(targetRoom);
            
            // Hydrate Room Type for the email template
            if (targetRoom.getRoomType() == null) {
                RoomType type = roomTypeRepository.findById(targetRoom.getRoomTypeId()).orElse(null);
                targetRoom.setRoomType(type);
            }
            
            emailService.sendUpdateConfirmation(user.getEmail(), r);
        } catch (Exception e) {
            System.err.println("Failed to send update email: " + e.getMessage());
        }

        return savedReservation;
    }
}