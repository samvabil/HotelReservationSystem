package com.skillstorm.hotelreservationsystem.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.skillstorm.hotelreservationsystem.models.Reservation;
import com.skillstorm.hotelreservationsystem.models.Reservation.ReservationStatus;
import com.skillstorm.hotelreservationsystem.repositories.ReservationRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReservationCleanupService {

    private final ReservationRepository reservationRepository;
    private final EmailService emailService;

    public ReservationCleanupService(ReservationRepository reservationRepository, EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.emailService = emailService;
    }

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