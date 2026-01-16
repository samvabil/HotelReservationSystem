package com.skillstorm.hotelreservationsystem.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillstorm.hotelreservationsystem.models.Reservation;
import com.skillstorm.hotelreservationsystem.models.Room;
import com.skillstorm.hotelreservationsystem.repositories.ReservationRepository;
import com.skillstorm.hotelreservationsystem.repositories.RoomRepository;

/**
 * Service class for scheduled room occupancy reconciliation tasks.
 * <p>
 * This service runs scheduled jobs to ensure room occupancy status accurately
 * reflects active checked-in reservations, preventing data inconsistencies.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Service
public class OccupancyReconciliationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;

    /**
     * Constructs a new OccupancyReconciliationService with the required repositories.
     *
     * @param reservationRepository The repository for reservation data access.
     * @param roomRepository The repository for room data access.
     */
    public OccupancyReconciliationService(ReservationRepository reservationRepository, RoomRepository roomRepository) {
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
    }

    /**
     * Scheduled task that runs daily at 3:00 AM to reconcile room occupancy status.
     * <p>
     * Ensures that rooms with active CHECKED_IN reservations (where today is within
     * the stay period) are marked as occupied, and rooms without such reservations
     * are marked as unoccupied.
     * </p>
     * <p>
     * Cron expression: "0 0 3 * * ?" = Every day at 3:00 AM.
     * </p>
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void reconcileOccupiedRooms() {
        LocalDate today = LocalDate.now();

        // Active checked-in reservations where today is within the stay
        List<Reservation> checkedIn = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == Reservation.ReservationStatus.CHECKED_IN)
                .filter(r -> r.getRoomId() != null)
                .filter(r -> r.getCheckIn() != null && r.getCheckOut() != null)
                .filter(r -> !today.isBefore(r.getCheckIn()) && today.isBefore(r.getCheckOut()))
                .toList();

        Set<String> shouldBeOccupiedRoomIds = checkedIn.stream()
                .map(Reservation::getRoomId)
                .collect(Collectors.toSet());

        // 1) Ensure rooms tied to active CHECKED_IN reservations are occupied
        if (!shouldBeOccupiedRoomIds.isEmpty()) {
            List<Room> rooms = roomRepository.findAllById(shouldBeOccupiedRoomIds);
            for (Room room : rooms) {
                if (!room.isOccupied()) room.setOccupied(true);
            }
            roomRepository.saveAll(rooms);
        }

        // 2) Clear rooms marked occupied but no longer have an active checked-in reservation
        List<Room> occupiedRooms = roomRepository.findByOccupiedTrue();
        List<Room> toClear = occupiedRooms.stream()
                .filter(r -> !shouldBeOccupiedRoomIds.contains(r.getId()))
                .collect(Collectors.toList());

        if (!toClear.isEmpty()) {
            for (Room room : toClear) room.setOccupied(false);
            roomRepository.saveAll(toClear);
        }
    }
}
