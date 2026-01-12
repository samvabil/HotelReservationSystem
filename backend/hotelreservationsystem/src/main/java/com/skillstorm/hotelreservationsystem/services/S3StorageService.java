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

@Service
public class S3StorageService {

    private final S3Client s3;
    private final String bucket;
    private final String region;

    public S3StorageService(
            S3Client s3,
            @Value("${aws.s3.bucket}") String bucket,
            @Value("${aws.region}") String region
    ) {
        this.s3 = s3;
        this.bucket = bucket;
        this.region = region;
    }

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

    private String detectContentType(MultipartFile file) {
    String ct = file.getContentType();
    if (ct == null || ct.isBlank()) return "image/png";
    return ct;
    }

    private String sanitizeFilename(String name) {
        String cleaned = name.trim().replace("\\", "/");
        if (cleaned.contains("/")) cleaned = cleaned.substring(cleaned.lastIndexOf("/") + 1);
        cleaned = cleaned.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (cleaned.isBlank()) cleaned = "image";

        if (!cleaned.contains(".")) cleaned += ".png";
        return cleaned.toLowerCase(Locale.ROOT);
    }

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
