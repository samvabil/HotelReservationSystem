package com.skillstorm.hotelreservationsystem.repositories;

import com.skillstorm.hotelreservationsystem.models.RoomType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for RoomType entities.
 * <p>
 * Provides basic CRUD operations for accessing room type data in MongoDB.
 * Room types define the specifications, amenities, and pricing for categories of rooms.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Repository
public interface RoomTypeRepository extends MongoRepository<RoomType, String> {

}