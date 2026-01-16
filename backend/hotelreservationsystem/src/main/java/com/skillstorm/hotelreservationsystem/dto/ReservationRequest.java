package com.skillstorm.hotelreservationsystem.dto;

import java.time.LocalDate;

/**
 * Data Transfer Object for reservation creation and update requests.
 * <p>
 * This DTO encapsulates all the information needed to create or update a reservation,
 * including room selection, dates, guest count, and payment verification.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
public class ReservationRequest {
    /**
     * The unique identifier of the room to reserve.
     */
    private String roomId;
    
    /**
     * The scheduled check-in date.
     */
    private LocalDate checkIn;
    
    /**
     * The scheduled check-out date.
     */
    private LocalDate checkOut;
    
    /**
     * The number of guests staying in the room.
     */
    private int guestCount;
    
    /**
     * The Stripe payment intent ID used to verify payment completion.
     */
    private String paymentIntentId; // To verify payment if needed

    /**
     * Gets the room identifier.
     *
     * @return The room ID.
     */
    public String getRoomId() { 
        return roomId; 
    }
    
    /**
     * Sets the room identifier.
     *
     * @param roomId The room ID to set.
     */
    public void setRoomId(String roomId) { 
        this.roomId = roomId; 
    }
    
    /**
     * Gets the check-in date.
     *
     * @return The check-in date.
     */
    public LocalDate getCheckIn() { 
        return checkIn; 
    }
    
    /**
     * Sets the check-in date.
     *
     * @param checkIn The check-in date to set.
     */
    public void setCheckIn(LocalDate checkIn) { 
        this.checkIn = checkIn; 
    }
    
    /**
     * Gets the check-out date.
     *
     * @return The check-out date.
     */
    public LocalDate getCheckOut() { 
        return checkOut; 
    }
    
    /**
     * Sets the check-out date.
     *
     * @param checkOut The check-out date to set.
     */
    public void setCheckOut(LocalDate checkOut) { 
        this.checkOut = checkOut; 
    }
    
    /**
     * Gets the guest count.
     *
     * @return The number of guests.
     */
    public int getGuestCount() { 
        return guestCount; 
    }
    
    /**
     * Sets the guest count.
     *
     * @param guestCount The number of guests to set.
     */
    public void setGuestCount(int guestCount) { 
        this.guestCount = guestCount; 
    }
    
    /**
     * Gets the Stripe payment intent ID.
     *
     * @return The payment intent ID.
     */
    public String getPaymentIntentId() { 
        return paymentIntentId; 
    }
    
    /**
     * Sets the Stripe payment intent ID.
     *
     * @param paymentIntentId The payment intent ID to set.
     */
    public void setPaymentIntentId(String paymentIntentId) { 
        this.paymentIntentId = paymentIntentId; 
    }
}