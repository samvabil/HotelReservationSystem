package com.skillstorm.hotelreservationsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for the Hotel Reservation System.
 * <p>
 * This Spring Boot application provides a REST API for managing hotel reservations,
 * rooms, room types, and user authentication. It integrates with MongoDB for data storage,
 * Stripe for payment processing, AWS S3 for image storage, and supports OAuth2 authentication
 * via Google.
 * </p>
 * <p>
 * The application enables scheduled tasks for reservation cleanup and occupancy reconciliation.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@SpringBootApplication
@EnableScheduling
public class HotelreservationsystemApplication {

	/**
	 * Main entry point for the Spring Boot application.
	 *
	 * @param args Command line arguments passed to the application.
	 */
	public static void main(String[] args) {
		SpringApplication.run(HotelreservationsystemApplication.class, args);
	}

}
