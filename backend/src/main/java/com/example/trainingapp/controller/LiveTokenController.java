package com.example.trainingapp.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@RestController
@RequestMapping("/api/live-token")
public class LiveTokenController {

    private final String googleApiKey;
    private final RestClient restClient;

    public LiveTokenController(
            @Value("${GEMINI_API_KEY}") String googleApiKey,
            RestClient.Builder restClientBuilder) {
        this.googleApiKey = googleApiKey;
        this.restClient = restClientBuilder.build();
    }

    @PostMapping
    public ResponseEntity<?> createToken(@RequestBody(required = false) Map<String, Integer> body) {
        int uses = (body != null && body.get("uses") != null) ? body.get("uses") : 1;
        if (uses < 1) {
            return ResponseEntity.badRequest().body(Map.of("error", "`uses` must be >= 1"));
        }

        try {
            ResponseEntity<Map<String, Object>> googleResponse = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("generativelanguage.googleapis.com")
                            .path("/v1alpha/auth_tokens")
                            .queryParam("key", googleApiKey)
                            .build())
                    .body(Map.of("uses", uses))
                    .retrieve()
                    .toEntity(new ParameterizedTypeReference<>() {
                    });

            return ResponseEntity.status(googleResponse.getStatusCode())
                    .body(googleResponse.getBody());
        } catch (RestClientResponseException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of("error", "Google API error", "details", ex.getResponseBodyAsString()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to create ephemeral token", "details", ex.getMessage()));
        }
    }
}
