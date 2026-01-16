package com.skillstorm.hotelreservationsystem.dto;

import java.util.List;

/**
 * Generic Data Transfer Object for paginated search responses.
 * <p>
 * This generic class provides a standardized format for paginated API responses,
 * containing the items for the current page along with pagination metadata.
 * </p>
 *
 * @param <T> The type of items in the response.
 *
 * @author SkillStorm
 * @version 1.0
 */
public class ReservationAdminSearchResponse<T> {
    /**
     * The list of items for the current page.
     */
    private List<T> items;
    
    /**
     * The current page number (0-indexed).
     */
    private int page;
    
    /**
     * The number of items per page.
     */
    private int size;
    
    /**
     * The total number of items across all pages.
     */
    private long totalItems;
    
    /**
     * The total number of pages.
     */
    private int totalPages;

    /**
     * Constructs a new ReservationAdminSearchResponse with the specified pagination data.
     *
     * @param items The list of items for the current page.
     * @param page The current page number.
     * @param size The number of items per page.
     * @param totalItems The total number of items across all pages.
     * @param totalPages The total number of pages.
     */
    public ReservationAdminSearchResponse(List<T> items, int page, int size, long totalItems, int totalPages) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.totalItems = totalItems;
        this.totalPages = totalPages;
    }

    /**
     * Gets the list of items for the current page.
     *
     * @return The list of items.
     */
    public List<T> getItems() { 
        return items; 
    }
    
    /**
     * Gets the current page number.
     *
     * @return The page number.
     */
    public int getPage() { 
        return page; 
    }
    
    /**
     * Gets the number of items per page.
     *
     * @return The page size.
     */
    public int getSize() { 
        return size; 
    }
    
    /**
     * Gets the total number of items across all pages.
     *
     * @return The total item count.
     */
    public long getTotalItems() { 
        return totalItems; 
    }
    
    /**
     * Gets the total number of pages.
     *
     * @return The total page count.
     */
    public int getTotalPages() { 
        return totalPages; 
    }
}
