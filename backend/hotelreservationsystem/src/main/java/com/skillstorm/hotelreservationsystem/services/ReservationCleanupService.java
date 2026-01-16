package com.skillstorm.hotelreservationsystem.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.skillstorm.hotelreservationsystem.models.Reservation;
import com.skillstorm.hotelreservationsystem.models.Reservation.ReservationStatus;
import com.skillstorm.hotelreservationsystem.repositories.ReservationRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Service class for scheduled reservation cleanup tasks.
 * <p>
 * This service runs scheduled jobs to automatically update reservation statuses
 * based on date criteria, such as marking past reservations as COMPLETED.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Service
public class ReservationCleanupService {

    private final ReservationRepository reservationRepository;
    private final EmailService emailService;

    /**
     * Constructs a new ReservationCleanupService with the required dependencies.
     *
     * @param reservationRepository The repository for reservation data access.
     * @param emailService The service for sending completion emails.
     */
    public ReservationCleanupService(ReservationRepository reservationRepository, EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.emailService = emailService;
    }

    /**
     * Scheduled task that runs daily at 4:00 AM to mark past reservations as COMPLETED.
     * <p>
     * Finds all CONFIRMED reservations with check-out dates before today and updates
     * them to COMPLETED status, sending completion emails to guests.
     * </p>
     * <p>
     * Cron expression: "0 0 4 * * ?" = Every day at 4:00 AM.
     * </p>
     */
    @Scheduled(cron = "0 0 4 * * ?")
    @Transactional // Ensure all updates happen in one transaction
    public void markPastReservationsAsCompleted() {
        System.out.println("Running Daily Reservation Cleanup...");

        LocalDate today = LocalDate.now();

        // 1. Find all reservations that ended BEFORE today and are still CONFIRMED
        List<Reservation> pastDueReservations = reservationRepository
                .findByCheckOutBeforeAndStatus(today, ReservationStatus.CONFIRMED);

        if (pastDueReservations.isEmpty()) {
            System.out.println("No reservations to update.");
            return;
        }

        // 2. Update them to COMPLETED
        for (Reservation res : pastDueReservations) {
            res.setStatus(ReservationStatus.COMPLETED);
            try {
                if (res.getUser() != null && res.getUser().getEmail() != null) {
                    emailService.sendStayCompletedEmail(res.getUser().getEmail(), res);
                }
            } catch (Exception e) {
                System.err.println("Failed to send completion email for Reservation " + res.getId() + ": " + e.getMessage());
            }
        }

        // 3. Save all changes
        reservationRepository.saveAll(pastDueReservations);

        System.out.println("Updated " + pastDueReservations.size() + " reservations to COMPLETED.");
    }
}