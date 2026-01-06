package com.skillstorm.hotelreservationsystem.controllers;

import com.skillstorm.hotelreservationsystem.dto.PaymentInfoRequest;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    // Inject the key from application.yml
    public PaymentController(@Value("${stripe.key}") String secretKey) {
        Stripe.apiKey = secretKey;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody PaymentInfoRequest paymentInfo) {
        try {
            // 1. Tell Stripe we want to create a payment
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) paymentInfo.getAmount()) // Stripe expects a Long
                    .setCurrency(paymentInfo.getCurrency())
                    .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .build()
                    )
                    .build();

            // 2. Send request to Stripe's servers
            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // 3. Send the 'clientSecret' back to React
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (StripeException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}