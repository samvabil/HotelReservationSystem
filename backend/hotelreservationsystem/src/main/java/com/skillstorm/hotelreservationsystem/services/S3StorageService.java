package com.skillstorm.hotelreservationsystem.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

/**
 * Service class for uploading files to AWS S3 storage.
 * <p>
 * This service handles uploading room type images to S3, including filename sanitization,
 * content type detection, and generating public URLs for the uploaded files.
 * </p>
 *
 * @author SkillStorm
 * @version 1.0
 */
@Service
public class S3StorageService {

    private final S3Client s3;
    private final String bucket;
    private final String region;

    /**
     * Constructs a new S3StorageService with the required AWS dependencies.
     *
     * @param s3 The S3Client for interacting with AWS S3.
     * @param bucket The S3 bucket name where files will be stored.
     * @param region The AWS region where the bucket is located.
     */
    public S3StorageService(
            S3Client s3,
            @Value("${aws.s3.bucket}") String bucket,
            @Value("${aws.region}") String region
    ) {
        this.s3 = s3;
        this.bucket = bucket;
        this.region = region;
    }

    /**
     * Uploads a room type image to S3 and returns the public URL.
     * <p>
     * The file is stored with a key pattern: {roomTypeId}/{timestamp}-{sanitized-filename}
     * to ensure uniqueness and organization.
     * </p>
     *
     * @param roomTypeId The unique identifier of the room type.
     * @param file The image file to upload.
     * @return The public HTTPS URL of the uploaded file.
     * @throws ResponseStatusException if the file is empty or upload fails.
     */
    public String uploadRoomTypeImage(String roomTypeId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required.");
        }

        String original = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String safeName = sanitizeFilename(original);

        String key = roomTypeId + "/" + Instant.now().toEpochMilli() + "-" + safeName;

        String contentType = detectContentType(file);

        try {
            PutObjectRequest req = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .build();

            s3.putObject(req, RequestBody.fromBytes(file.getBytes()));
        } catch (Exception e) {
            e.printStackTrace(); 
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "S3 upload failed: " + e.getClass().getSimpleName() + " - " + e.getMessage()
            );
        }


        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + urlEncodePath(key);
    }

    /**
     * Detects the content type of an uploaded file.
     * Defaults to "image/png" if content type cannot be determined.
     *
     * @param file The uploaded file.
     * @return The content type string.
     */
    private String detectContentType(MultipartFile file) {
    String ct = file.getContentType();
    if (ct == null || ct.isBlank()) return "image/png";
    return ct;
    }

    /**
     * Sanitizes a filename to ensure it's safe for S3 storage.
     * <p>
     * Removes path separators, replaces invalid characters with underscores,
     * ensures lowercase, and adds a default extension if missing.
     * </p>
     *
     * @param name The original filename.
     * @return The sanitized filename.
     */
    private String sanitizeFilename(String name) {
        String cleaned = name.trim().replace("\\", "/");
        if (cleaned.contains("/")) cleaned = cleaned.substring(cleaned.lastIndexOf("/") + 1);
        cleaned = cleaned.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (cleaned.isBlank()) cleaned = "image";

        if (!cleaned.contains(".")) cleaned += ".png";
        return cleaned.toLowerCase(Locale.ROOT);
    }

    /**
     * URL-encodes each segment of an S3 key path.
     * <p>
     * Encodes each path segment separately to preserve directory structure
     * while ensuring special characters are properly encoded.
     * </p>
     *
     * @param key The S3 object key (path).
     * @return The URL-encoded path.
     */
    private String urlEncodePath(String key) {
        String[] parts = key.split("/");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) sb.append("/");
            sb.append(URLEncoder.encode(parts[i], StandardCharsets.UTF_8));
        }
        return sb.toString();
    }
}
