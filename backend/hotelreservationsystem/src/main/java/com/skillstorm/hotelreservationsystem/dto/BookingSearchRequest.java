package com.skillstorm.hotelreservationsystem.dto;

import java.time.LocalDate;
import java.util.List;

public class BookingSearchRequest {
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guestCount;
    
    // Room Filters (Nullable to allow "Don't Care")
    private Double minPrice;
    private Double maxPrice;
    private String roomType; // e.g., "Suite"
    private Integer minBeds;
    private Integer minBedrooms;

    // Amenities
    private Boolean accessible;
    private Boolean petFriendly;
    private Boolean nonSmoking;
    private Boolean hasJacuzzi;

    // Gaming
    private Integer pcCount;
    private String pcTier;
    private List<String> consoles;


    
    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }
    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }
    public Integer getGuestCount() {
        return guestCount;
    }
    public void setGuestCount(Integer guestCount) {
        this.guestCount = guestCount;
    }
    public Double getMinPrice() {
        return minPrice;
    }
    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }
    public Double getMaxPrice() {
        return maxPrice;
    }
    public void setMaxPrice(Double maxPrice) {
        this.maxPrice = maxPrice;
    }
    public String getRoomType() {
        return roomType;
    }
    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }
    public Integer getMinBeds() {
        return minBeds;
    }
    public void setMinBeds(Integer minBeds) {
        this.minBeds = minBeds;
    }
    public Integer getMinBedrooms() {
        return minBedrooms;
    }
    public void setMinBedrooms(Integer minBedrooms) {
        this.minBedrooms = minBedrooms;
    }
    public Boolean getAccessible() {
        return accessible;
    }
    public void setAccessible(Boolean accessible) {
        this.accessible = accessible;
    }
    public Boolean getPetFriendly() {
        return petFriendly;
    }
    public void setPetFriendly(Boolean petFriendly) {
        this.petFriendly = petFriendly;
    }
    public Boolean getNonSmoking() {
        return nonSmoking;
    }
    public void setNonSmoking(Boolean nonSmoking) {
        this.nonSmoking = nonSmoking;
    }
    public Boolean getHasJacuzzi() {
        return hasJacuzzi;
    }
    public void setHasJacuzzi(Boolean hasJacuzzi) {
        this.hasJacuzzi = hasJacuzzi;
    }
    public Integer getPcCount() {
        return pcCount;
    }
    public void setPcCount(Integer pcCount) {
        this.pcCount = pcCount;
    }
    public String getPcTier() {
        return pcTier;
    }
    public void setPcTier(String pcTier) {
        this.pcTier = pcTier;
    }
    public List<String> getConsoles() {
        return consoles;
    }
    public void setConsoles(List<String> consoles) {
        this.consoles = consoles;
    }
    
    
}