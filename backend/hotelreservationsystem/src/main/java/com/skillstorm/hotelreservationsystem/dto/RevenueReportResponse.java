package com.skillstorm.hotelreservationsystem.dto;

import java.util.Map;

/**
 * Data Transfer Object for revenue report responses.
 * <p>
 * This DTO encapsulates revenue data including total revenue and monthly breakdowns.
 * All monetary amounts are stored in cents to avoid floating-point precision issues.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
public class RevenueReportResponse {
    /**
     * The total revenue in cents across all time periods.
     */
    private long totalRevenueCents;
    
    /**
     * A map of monthly revenue where keys are month strings in "YYYY-MM" format
     * and values are revenue amounts in cents (e.g., "2026-01" -> 1500000 represents $15,000.00).
     */
    private Map<String, Long> revenueByMonthCents; // "2026-01" -> cents

    /**
     * Constructs a new RevenueReportResponse with the specified revenue data.
     *
     * @param totalRevenueCents The total revenue in cents.
     * @param revenueByMonthCents A map of monthly revenue breakdowns.
     */
    public RevenueReportResponse(long totalRevenueCents, Map<String, Long> revenueByMonthCents) {
        this.totalRevenueCents = totalRevenueCents;
        this.revenueByMonthCents = revenueByMonthCents;
    }

    /**
     * Gets the total revenue in cents.
     *
     * @return The total revenue in cents.
     */
    public long getTotalRevenueCents() { 
        return totalRevenueCents; 
    }
    
    /**
     * Gets the monthly revenue breakdown map.
     *
     * @return A map where keys are month strings ("YYYY-MM") and values are revenue in cents.
     */
    public Map<String, Long> getRevenueByMonthCents() { 
        return revenueByMonthCents; 
    }
}
