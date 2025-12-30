package com.skillstorm.hotelreservationsystem.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "room_types")
public class RoomType {

    @Id
    private String id;

    private String name;
    private double pricePerNight;
    
    // --- Bed Config ---
    private int numBeds;
    private String typeBed;
    private int numBeedroom;
    
    // --- Specs ---
    private int squareFeet;
    private int capacity;
    
    // --- Amenities ---
    private boolean hasJacuzzi;
    private boolean hasKitchen;
    
    // --- Gaming Gear (The unique stuff) ---
    private int levelOfPc;
    private int numPcs;
    private List<String> consoles;

    // --- Media ---
    private List<String> images; // URLs to S3

    // Constructors, Getters, and Setters...
}