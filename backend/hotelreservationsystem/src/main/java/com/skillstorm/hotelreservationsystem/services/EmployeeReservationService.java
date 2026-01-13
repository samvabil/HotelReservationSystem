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

@Service
public class EmployeeReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final UserRepository userRepository;

    private final ReservationService reservationService; // reuse cancel logic and guest update if desired

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

        // Reuse your overlap and unavailableDates logic by calling the existing service update method,
        // but note: your updateReservation recalculates totalPrice and updates room calendars.
        Reservation updated = reservationService.updateReservation(reservationId, request);

        // Ensure hydration for employee UI
        hydrate(List.of(updated));
        return updated;
    }

    @Transactional
    public void employeeCancelReservation(String reservationId) {
        Reservation existing = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found: " + reservationId));

        if (existing.getStatus() == Reservation.ReservationStatus.CHECKED_IN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel a reservation that is currently checked in.");
        }

        reservationService.cancelReservation(reservationId);
    }

    @Transactional
    public Reservation checkIn(String reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found: " + reservationId));

        if (r.getStatus() != Reservation.ReservationStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only CONFIRMED reservations can be checked in.");
        }

        Room room = roomRepository.findById(r.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found: " + r.getRoomId()));

        room.setOccupied(true);
        roomRepository.save(room);

        r.setStatus(Reservation.ReservationStatus.CHECKED_IN);
        r.setCheckedInAt(Instant.now());

        Reservation saved = reservationRepository.save(r);
        hydrate(List.of(saved));
        return saved;
    }

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
     * Revenue report:
     * sum(PAID and status in CONFIRMED/CHECKED_IN/COMPLETED) minus sum(REFUNDED)
     * Uses transaction.amountCents.
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

            boolean isPositive =
                    r.getPaymentStatus() == Reservation.PaymentStatus.PAID
                    && (r.getStatus() == Reservation.ReservationStatus.CONFIRMED
                        || r.getStatus() == Reservation.ReservationStatus.CHECKED_IN
                        || r.getStatus() == Reservation.ReservationStatus.COMPLETED);

            boolean isNegative =
                    r.getPaymentStatus() == Reservation.PaymentStatus.REFUNDED
                    || r.getStatus() == Reservation.ReservationStatus.REFUNDED;

            long delta = 0L;
            if (isPositive) delta = cents;
            if (isNegative) delta = -cents;

            if (delta == 0L) continue;

            total += delta;

            String monthKey = paidDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            byMonth.put(monthKey, byMonth.getOrDefault(monthKey, 0L) + delta);
        }

        return new RevenueReportResponse(total, byMonth);
    }

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
