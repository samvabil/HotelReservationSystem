package com.skillstorm.hotelreservationsystem.dto;

/**
 * Data Transfer Object for payment information requests.
 * <p>
 * This DTO contains the amount and currency information needed to create
 * a payment intent with Stripe or other payment processors.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
public class PaymentInfoRequest {
    /**
     * The payment amount in cents (e.g., 10000 represents $100.00).
     */
    private int amount; // Amount in cents
    
    /**
     * The currency code (e.g., "usd", "eur").
     */
    private String currency;

    /**
     * Gets the payment amount in cents.
     *
     * @return The amount in cents.
     */
    public int getAmount() { 
        return amount; 
    }
    
    /**
     * Sets the payment amount in cents.
     *
     * @param amount The amount in cents to set.
     */
    public void setAmount(int amount) { 
        this.amount = amount; 
    }

    /**
     * Gets the currency code.
     *
     * @return The currency code.
     */
    public String getCurrency() { 
        return currency; 
    }
    
    /**
     * Sets the currency code.
     *
     * @param currency The currency code to set.
     */
    public void setCurrency(String currency) { 
        this.currency = currency; 
    }
}