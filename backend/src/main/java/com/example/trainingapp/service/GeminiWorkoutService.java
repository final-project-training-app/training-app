package com.example.trainingapp.service;

import com.example.trainingapp.entity.User;
import com.example.trainingapp.entity.Workout;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class GeminiWorkoutService {

    private final String googleApiKey;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public GeminiWorkoutService(@Value("${GEMINI_API_KEY}") String googleApiKey) {
        this.googleApiKey = googleApiKey;
        this.objectMapper = new ObjectMapper();
        this.restTemplate = new RestTemplate();
        System.out.println("[Gemini-Debug] Swapped to production REST optimization engine.");
    }

    public CompletableFuture<String> recommendWorkoutWithReasoning(User user, List<Workout> workouts) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // 1. Build list map matching problem requirements
                List<Map<String, Object>> workoutsForPrompt = workouts.stream().map(w -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", w.getId());
                    m.put("name", w.getName());
                    m.put("level", w.getLevel());
                    m.put("type", w.getType());
                    m.put("kneeFriendly", w.getKneeFriendly());
                    m.put("lowImpact", w.getLowImpact());
                    m.put("seated", w.getSeated());
                    m.put("beginnerFriendly", w.getBeginnerFriendly());
                    return m;
                }).collect(Collectors.toList());

                String workoutsListJson = objectMapper.writeValueAsString(workoutsForPrompt);

                String userIntensity = user.getIntensityLevel() == null ? "unspecified" : user.getIntensityLevel().toString();
                String userContext = user.getContext() == null ? "" : user.getContext();

                String promptData = String.format(
                        "User Profile Data:\n- Name: %s\n- Intensity Level (reference): %s\n- Context / Preferences: %s\n\nAvailable Workout Options (JSON array):\n%s\n\n"
                                + "Pick exactly one workout that best matches the user's profile, the reasoning behind the decision, and return a strict JSON object structure matching: {\"workoutId\": 1, \"reasoning\": \"string text\"}.",
                        user.getName(), userIntensity, userContext, workoutsListJson
                );

                // 2. Build official REST payload according to Google API layout guidelines
                Map<String, Object> textPart = Map.of("text", promptData);
                Map<String, Object> partsBlock = Map.of("parts", List.of(textPart));
                Map<String, Object> contentsBlock = Map.of("role", "user", "parts", partsBlock.get("parts"));

                // Nest config data safely inside official parameter tokens
                Map<String, Object> generationConfig = Map.of(
                        "responseMimeType", "application/json"
                );

                Map<String, Object> requestBody = Map.of(
                        "contents", List.of(contentsBlock),
                        "generationConfig", generationConfig
                );

                // 3. Fire synchronous execution inside the CompletableFuture background worker thread
                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + googleApiKey;
                String rawResponse = restTemplate.postForObject(url, requestBody, String.class);

                // 4. Dig out text node value from Google response packaging layers
                JsonNode root = objectMapper.readTree(rawResponse);
                String resultJsonString = root.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText();

                System.out.println("[Gemini-Debug] AI Response captured: " + resultJsonString.trim());
                return resultJsonString.trim();

            } catch (Exception e) {
                System.err.println("[Gemini-Debug] Execution failure: " + e.getMessage());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to resolve recommendation: " + e.getMessage());
            }
        });
    }
}