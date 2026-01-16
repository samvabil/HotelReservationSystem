package com.skillstorm.hotelreservationsystem.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * Data Transfer Object for room search requests.
 * <p>
 * This DTO encapsulates all search criteria that can be used to filter available rooms,
 * including date ranges, pricing, amenities, and gaming equipment specifications.
 * All filter fields are optional to allow flexible searching.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
public class BookingSearchRequest {
    /**
     * The desired check-in date for the reservation.
     */
    private LocalDate checkInDate;
    
    /**
     * The desired check-out date for the reservation.
     */
    private LocalDate checkOutDate;
    
    /**
     * The number of guests that will be staying.
     */
    private Integer guestCount;
    
    /**
     * The minimum price per night to filter by (nullable).
     */
    private Double minPrice;
    
    /**
     * The maximum price per night to filter by (nullable).
     */
    private Double maxPrice;
    
    /**
     * The room type name to filter by (e.g., "Suite").
     */
    private String roomType; // e.g., "Suite"
    
    /**
     * The minimum number of beds required (nullable).
     */
    private Integer minBeds;
    
    /**
     * The minimum number of bedrooms required (nullable).
     */
    private Integer minBedrooms;

    /**
     * Whether the room must be accessible (ADA compliant) (nullable).
     */
    private Boolean accessible;
    
    /**
     * Whether the room must allow pets (nullable).
     */
    private Boolean petFriendly;
    
    /**
     * Whether the room must be non-smoking (nullable).
     */
    private Boolean nonSmoking;
    
    /**
     * Whether the room must have a jacuzzi (nullable).
     */
    private Boolean hasJacuzzi;

    /**
     * The required number of gaming PCs in the room (nullable).
     */
    private Integer pcCount;
    
    /**
     * The required performance tier of gaming PCs (nullable).
     */
    private String pcTier;
    
    /**
     * The list of required gaming consoles (nullable).
     */
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