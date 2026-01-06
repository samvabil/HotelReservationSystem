package com.skillstorm.hotelreservationsystem.dto;

public class PaymentInfoRequest {
    private int amount; // Amount in cents
    private String currency;

    // Getters and Setters
    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}