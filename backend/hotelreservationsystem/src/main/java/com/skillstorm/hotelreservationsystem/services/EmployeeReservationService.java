package com.skillstorm.hotelreservationsystem.services;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.skillstorm.hotelreservationsystem.dto.ReservationRequest;
import com.skillstorm.hotelreservationsystem.dto.RevenueReportResponse;
import com.skillstorm.hotelreservationsystem.models.Reservation;
import com.skillstorm.hotelreservationsystem.models.Room;
import com.skillstorm.hotelreservationsystem.models.RoomType;
import com.skillstorm.hotelreservationsystem.models.User;
import com.skillstorm.hotelreservationsystem.repositories.ReservationRepository;
import com.skillstorm.hotelreservationsystem.repositories.RoomRepository;
import com.skillstorm.hotelreservationsystem.repositories.RoomTypeRepository;
import com.skillstorm.hotelreservationsystem.repositories.UserRepository;

/**
 * Service class for employee reservation management operations.
 * <p>
 * This service provides enhanced reservation management capabilities for employees,
 * including search with filters, updates with employee override privileges, check-in/check-out,
 * and revenue reporting. Employee operations can waive payment requirements for upgrades.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Service
public class EmployeeReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final UserRepository userRepository;

    /** Reuses reservation service for cancel logic and guest update operations. */
    private final ReservationService reservationService; // reuse cancel logic and guest update if desired

    /**
     * Constructs a new EmployeeReservationService with the required repositories and services.
     *
     * @param reservationRepository The repository for reservation data access.
     * @param roomRepository The repository for room data access.
     * @param roomTypeRepository The repository for room type data access.
     * @param userRepository The repository for user data access.
     * @param reservationService The reservation service for shared logic.
     */
    public EmployeeReservationService(
            ReservationRepository reservationRepository,
            RoomRepository roomRepository,
            RoomTypeRepository roomTypeRepository,
            UserRepository userRepository,
            ReservationService reservationService
    ) {
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.userRepository = userRepository;
        this.reservationService = reservationService;
    }

    /**
     * Searches for reservations with multiple filter criteria and pagination.
     * <p>
     * Supports filtering by reservation ID, guest email, room type, status, check-in state,
     * and date ranges. Converts email to user ID and room type to room IDs for the search.
     * </p>
     *
     * @param reservationId The unique identifier of the reservation to search for.
     * @param guestEmail The email address of the guest to filter by.
     * @param roomTypeId The room type ID to filter by.
     * @param status The reservation status to filter by.
     * @param currentlyCheckedIn Whether to filter by check-in status.
     * @param from The start date for date range filtering.
     * @param to The end date for date range filtering.
     * @param pageable Pagination information.
     * @return A page of reservations matching the search criteria with hydrated user and room data.
     * @throws ResponseStatusException if the guest email is not found.
     */
    public Page<Reservation> search(
            String reservationId,
            String guestEmail,
            String roomTypeId,
            Reservation.ReservationStatus status,
            Boolean currentlyCheckedIn,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    ) {
        String userId = null;
        if (guestEmail != null && !guestEmail.isBlank()) {
            User u = userRepository.findByEmail(guestEmail.toLowerCase())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + guestEmail));
            userId = u.getId();
        }

        List<String> roomIds = null;
        if (roomTypeId != null && !roomTypeId.isBlank()) {
            roomIds = roomRepository.findByRoomTypeId(roomTypeId)
                    .stream()
                    .map(Room::getId)
                    .toList();
        }

        Page<Reservation> page = reservationRepository.adminSearch(
                reservationId,
                userId,
                roomIds,
                status,
                currentlyCheckedIn,
                from,
                to,
                pageable
        );

        hydrate(page.getContent());
        return page;
    }

    /**
     * Updates a reservation with employee override privileges.
     * <p>
     * Employee updates can waive payment requirements for upgrades. This method
     * prevents editing checked-in, cancelled, refunded, or completed reservations.
     * </p>
     *
     * @param reservationId The unique identifier of the reservation to update.
     * @param request The updated reservation details.
     * @return The updated reservation with hydrated user and room data.
     * @throws ResponseStatusException if the reservation is not found or in an invalid state.
     */
    @Transactional
    public Reservation employeeUpdateReservation(String reservationId, ReservationRequest request) {
        Reservation existing = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found: " + reservationId));

        if (existing.getStatus() == Reservation.ReservationStatus.CHECKED_IN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot edit a reservation that is currently checked in.");
        }
        if (existing.getStatus() == Reservation.ReservationStatus.CANCELLED
                || existing.getStatus() == Reservation.ReservationStatus.REFUNDED
                || existing.getStatus() == Reservation.ReservationStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot edit a reservation in status: " + existing.getStatus());
        }
        Reservation updated = reservationService.updateReservation(reservationId, request, true);

        hydrate(List.of(updated));
        return updated;
    }

    /**
     * Cancels a reservation with employee override privileges.
     * <p>
     * Prevents cancelling reservations that are currently checked in.
     * </p>
     *
     * @param reservationId The unique identifier of the reservation to cancel.
     * @throws ResponseStatusException if the reservation is not found or is checked in.
     */
    @Transactional
    public void employeeCancelReservation(String reservationId) {
        Reservation existing = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found: " + reservationId));

        if (existing.getStatus() == Reservation.ReservationStatus.CHECKED_IN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel a reservation that is currently checked in.");
        }

        reservationService.cancelReservation(reservationId);
    }

    /**
     * Checks in a guest for a reservation.
     * <p>
     * Validates that the reservation is CONFIRMED, the current date is within
     * the check-in/check-out window, and the room is not already occupied.
     * Marks the room as occupied and updates the reservation status.
     * </p>
     *
     * @param reservationId The unique identifier of the reservation.
     * @return The updated reservation with CHECKED_IN status.
     * @throws ResponseStatusException if validation fails or the reservation/room is not found.
     */
    @Transactional
    public Reservation checkIn(String reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found: " + reservationId));

        if (r.getStatus() != Reservation.ReservationStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only CONFIRMED reservations can be checked in.");
        }

        LocalDate today = LocalDate.now();

        if (today.isBefore(r.getCheckIn())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot check in before the scheduled check-in date: " + r.getCheckIn()
            );
        }

        if (!today.isBefore(r.getCheckOut())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot check in on/after the scheduled check-out date: " + r.getCheckOut()
            );
        }

        Room room = roomRepository.findById(r.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found: " + r.getRoomId()));

        if (room.isOccupied()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Room is already occupied and cannot be checked in: " + room.getRoomNumber()
            );
        }

        room.setOccupied(true);
        roomRepository.save(room);

        r.setStatus(Reservation.ReservationStatus.CHECKED_IN);
        r.setCheckedInAt(Instant.now());

        Reservation saved = reservationRepository.save(r);
        hydrate(List.of(saved));
        return saved;
    }

    /**
     * Checks out a guest from a reservation.
     * <p>
     * Marks the room as unoccupied and updates the reservation status to COMPLETED.
     * </p>
     *
     * @param reservationId The unique identifier of the reservation.
     * @return The updated reservation with COMPLETED status.
     * @throws ResponseStatusException if the reservation is not CHECKED_IN or not found.
     */
    @Transactional
    public Reservation checkOut(String reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found: " + reservationId));

        if (r.getStatus() != Reservation.ReservationStatus.CHECKED_IN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only CHECKED_IN reservations can be checked out.");
        }

        Room room = roomRepository.findById(r.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found: " + r.getRoomId()));

        room.setOccupied(false);
        roomRepository.save(room);

        r.setStatus(Reservation.ReservationStatus.COMPLETED);

        Reservation saved = reservationRepository.save(r);
        hydrate(List.of(saved));
        return saved;
    }

    /**
     * Generates a revenue report for the specified date range.
     * <p>
     * Calculates revenue as: sum of PAID transactions (for CONFIRMED/CHECKED_IN/COMPLETED reservations)
     * minus sum of REFUNDED transactions. Uses transaction.amountCents for accuracy.
     * </p>
     *
     * @param from The start date for the report (optional, null for all time).
     * @param to The end date for the report (optional, null for all time).
     * @return A revenue report with total and monthly breakdowns.
     */
    public RevenueReportResponse revenue(LocalDate from, LocalDate to) {
        List<Reservation> all = reservationRepository.findAll();
        hydrateLight(all);

        long total = 0L;
        Map<String, Long> byMonth = new TreeMap<>();

        for (Reservation r : all) {
            if (r.getTransaction() == null) continue;

            Instant paidAt = r.getTransaction().getPaidAt();
            if (paidAt == null) continue;

            LocalDate paidDate = paidAt.atZone(ZoneOffset.UTC).toLocalDate();
            if (from != null && paidDate.isBefore(from)) continue;
            if (to != null && !paidDate.isBefore(to)) continue;

            long cents = r.getTransaction().getAmountCents();

            long delta = 0L;
            
            // Refunds always subtract
            if (r.getPaymentStatus() == Reservation.PaymentStatus.REFUNDED 
                    || r.getStatus() == Reservation.ReservationStatus.REFUNDED) {
                delta = -cents;
            }
            // Completed/Confirmed/Checked-in with PAID status adds to revenue
            else if (r.getPaymentStatus() == Reservation.PaymentStatus.PAID
                    && (r.getStatus() == Reservation.ReservationStatus.CONFIRMED
                        || r.getStatus() == Reservation.ReservationStatus.CHECKED_IN
                        || r.getStatus() == Reservation.ReservationStatus.COMPLETED)) {
                delta = cents;
            }

            if (delta == 0L) continue;

            total += delta;

            String monthKey = paidDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            byMonth.put(monthKey, byMonth.getOrDefault(monthKey, 0L) + delta);
        }

        return new RevenueReportResponse(total, byMonth);
    }

    /**
     * Populates transient User and Room objects for a list of reservations.
     * <p>
     * This method fetches user and room data from repositories and attaches
     * them to reservations for frontend display purposes.
     * </p>
     *
     * @param reservations The list of reservations to hydrate.
     */
    private void hydrate(List<Reservation> reservations) {
        if (reservations == null || reservations.isEmpty()) return;

        Set<String> userIds = reservations.stream()
                .map(Reservation::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<String> roomIds = reservations.stream()
                .map(Reservation::getRoomId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<Room> rooms = roomRepository.findAllById(roomIds);
        Map<String, Room> roomsById = rooms.stream()
                .collect(Collectors.toMap(Room::getId, rr -> rr));

        Set<String> typeIds = rooms.stream()
                .map(Room::getRoomTypeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, RoomType> typesById = roomTypeRepository.findAllById(typeIds).stream()
                .collect(Collectors.toMap(RoomType::getId, t -> t));

        for (Reservation r : reservations) {
            User u = usersById.get(r.getUserId());
            if (u != null) r.setUser(u);

            Room room = roomsById.get(r.getRoomId());
            if (room != null) {
                if (room.getRoomTypeId() != null) {
                    room.setRoomType(typesById.get(room.getRoomTypeId()));
                }
                r.setRoom(room);
            }
        }
    }

    /**
     * Light hydration for revenue report, avoids room type work.
     */
    private void hydrateLight(List<Reservation> reservations) {
        if (reservations == null || reservations.isEmpty()) return;

        Set<String> userIds = reservations.stream()
                .map(Reservation::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        for (Reservation r : reservations) {
            User u = usersById.get(r.getUserId());
            if (u != null) r.setUser(u);
        }
    }
}
