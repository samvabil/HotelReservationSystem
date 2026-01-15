package com.skillstorm.hotelreservationsystem.dto;

import java.util.Map;

public class RevenueReportResponse {
    private long totalRevenueCents;
    private Map<String, Long> revenueByMonthCents; // "2026-01" -> cents

    public RevenueReportResponse(long totalRevenueCents, Map<String, Long> revenueByMonthCents) {
        this.totalRevenueCents = totalRevenueCents;
        this.revenueByMonthCents = revenueByMonthCents;
    }

    public long getTotalRevenueCents() { return totalRevenueCents; }
    public Map<String, Long> getRevenueByMonthCents() { return revenueByMonthCents; }
}
