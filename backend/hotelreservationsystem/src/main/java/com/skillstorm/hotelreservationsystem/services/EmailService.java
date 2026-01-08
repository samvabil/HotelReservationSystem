package com.skillstorm.hotelreservationsystem.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.skillstorm.hotelreservationsystem.models.Reservation;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendReservationConfirmation(String toEmail, Reservation reservation) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setFrom("huggins9000211@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Level Up Lounge - Reservation Confirmed!");
        
        String body = String.format("""
            Dear %s,
            
            Thank you for booking with Skillstorm Hotel!
            
            CONFIRMATION DETAILS
            --------------------------------------
            Confirmation #: %s
            Room: %s (%s)
            
            Check-In:  %s (After 3:00 PM)
            Check-Out: %s (Before 11:00 AM)
            
            Guests: %d
            Total Paid: $%.2f
            --------------------------------------
            
            To cancel or view your booking, visit the "My Reservations" page on our website.
            
            We look forward to hosting you!
            
            Warm Regards,
            Level Up Lounge
            """,
            reservation.getUser().getFirstName(),
            reservation.getId(),
            reservation.getRoom().getRoomNumber(),
            reservation.getRoom().getRoomType().getName(),
            reservation.getCheckIn(),
            reservation.getCheckOut(),
            reservation.getGuestCount(),
            reservation.getTotalPrice()
        );

        message.setText(body);
        mailSender.send(message);
    }

    public void sendCancellationConfirmation(String toEmail, Reservation reservation) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setFrom("huggins9000211@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Level Up Lounge - Reservation Cancelled");

        // Determine specific message based on status
        String refundNote = "";
        if (reservation.getStatus() == Reservation.ReservationStatus.REFUNDED) {
            refundNote = String.format("""
                
                REFUND STATUS: PROCESSED
                Amount: $%.2f
                Please allow 5-10 business days for the funds to appear in your account.
                """, reservation.getTotalPrice());
        }

        String body = String.format("""
            Dear %s,
            
            This email confirms that your reservation has been cancelled.
            
            CANCELLATION DETAILS
            --------------------------------------
            Confirmation #: %s
            Room: %s
            Original Dates: %s to %s
            Status: %s
            %s
            --------------------------------------
            
            We hope to have the opportunity to host you in the future.
            
            Warm Regards,
            Level Up Lounge
            """,
            reservation.getUser().getFirstName(),
            reservation.getId(),
            reservation.getRoom().getRoomNumber(),
            reservation.getCheckIn(),
            reservation.getCheckOut(),
            reservation.getStatus(), // "CANCELLED" or "REFUNDED"
            refundNote // Inserts the refund text only if applicable
        );

        message.setText(body);
        mailSender.send(message);
    }

    public void sendUpdateConfirmation(String toEmail, Reservation reservation) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setFrom("anthonyhugginsdev@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Level Up Lounge - Reservation Updated");

        String body = String.format("""
            Dear %s,
            
            Your reservation has been successfully updated.
            
            UPDATED DETAILS
            --------------------------------------
            Confirmation #: %s
            Room: %s (%s)
            
            New Check-In:  %s
            New Check-Out: %s
            
            Guests: %d
            New Total: $%.2f
            --------------------------------------
            
            If you did not request this change, please contact us immediately.
            
            Warm Regards,
            Level Up Lounge
            """,
            reservation.getUser().getFirstName(),
            reservation.getId(),
            reservation.getRoom().getRoomNumber(),
            reservation.getRoom().getRoomType().getName(),
            reservation.getCheckIn(),
            reservation.getCheckOut(),
            reservation.getGuestCount(),
            reservation.getTotalPrice()
        );

        message.setText(body);
        mailSender.send(message);
        System.out.println("Update email sent to " + toEmail);
    }
}
