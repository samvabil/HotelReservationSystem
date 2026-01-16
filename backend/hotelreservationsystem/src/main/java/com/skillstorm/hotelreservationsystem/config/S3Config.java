package com.skillstorm.hotelreservationsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * Configuration class for AWS S3 client bean.
 * <p>
 * This configuration creates and configures an S3Client bean for interacting
 * with Amazon S3 storage service, used for uploading room type images.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Configuration
public class S3Config {

    /**
     * Creates an S3Client bean configured for the specified AWS region.
     *
     * @param region The AWS region string (injected from application properties).
     * @return A configured S3Client instance.
     */
    @Bean
    public S3Client s3Client(@Value("${aws.region}") String region) {
        return S3Client.builder()
                .region(Region.of(region))
                .build();
    }
}
