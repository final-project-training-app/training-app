package com.example.trainingapp.service;

import com.example.trainingapp.dto.RecommendWorkoutDTO;
import com.example.trainingapp.dto.TrainerRequestDto;
import com.example.trainingapp.entity.Trainer;
import com.example.trainingapp.entity.User;
import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.repository.TrainerRepository;
import com.example.trainingapp.repository.UserRepository;
import com.example.trainingapp.repository.WorkoutRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.springframework.http.HttpStatus.*;

@Service
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final GeminiWorkoutService geminiWorkoutService;
    private final WorkoutRepository workoutRepository;
    private final ObjectMapper objectMapper; // Needed to process json chunks locally


    public TrainerService(TrainerRepository trainerRepository, UserRepository userRepository, GeminiWorkoutService geminiWorkoutService, WorkoutRepository workoutRepository, ObjectMapper objectMapper) {
        this.trainerRepository = trainerRepository;
        this.userRepository = userRepository;
        this.geminiWorkoutService = geminiWorkoutService;
        this.workoutRepository = workoutRepository;
        this.objectMapper = objectMapper;
    }

    public List<Trainer> getAllTrainers() {
        return trainerRepository.findAll();
    }

    public Trainer createTrainer(TrainerRequestDto request) {
        if (request == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Request body is required");
        }

        String name = normalizeRequired(request.name(), "name", 120);
        String prompt = normalizeRequired(request.prompt(), "prompt", 8000);
        String voice = normalizeRequired(request.voice(), "voice", 120);
        String intro = normalizeRequired(request.intro(), "intro", 2048);
        String language = normalizeRequired(request.language(), "language", 40);

        if (trainerRepository.existsByNameIgnoreCaseAndLanguageIgnoreCase(name, language)) {
            throw new ResponseStatusException(CONFLICT, "Trainer already exists for this language");
        }

        Trainer trainer = new Trainer();
        trainer.setName(name);
        trainer.setPrompt(prompt);
        trainer.setVoice(voice);
        trainer.setIntro(intro);
        trainer.setLanguage(language);
        trainer.setImageSelect(normalizeOptional(request.imageSelect(), "imageSelect", 2048));
        trainer.setImageCall(normalizeOptional(request.imageCall(), "imageCall", 2048));
        trainer.setImageStart(normalizeOptional(request.imageStart(), "imageStart", 2048));

        return trainerRepository.save(trainer);
    }

    public Trainer updateTrainer(Long id, TrainerRequestDto request) {
        validateId(id);

        if (request == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Request body is required");
        }

        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Trainer not found"));

        String name = normalizeRequired(request.name(), "name", 120);
        String prompt = normalizeRequired(request.prompt(), "prompt", 8000);
        String voice = normalizeRequired(request.voice(), "voice", 120);
        String intro = normalizeRequired(request.intro(), "intro", 2048);
        String language = normalizeRequired(request.language(), "language", 40);

        if (trainerRepository.existsByNameIgnoreCaseAndLanguageIgnoreCase(name, language)
                && (!name.equalsIgnoreCase(trainer.getName())
                || !language.equalsIgnoreCase(trainer.getLanguage()))) {
            throw new ResponseStatusException(CONFLICT, "Trainer already exists for this language");
        }

        trainer.setName(name);
        trainer.setPrompt(prompt);
        trainer.setVoice(voice);
        trainer.setIntro(intro);
        trainer.setLanguage(language);
        trainer.setImageSelect(normalizeOptional(request.imageSelect(), "imageSelect", 2048));
        trainer.setImageCall(normalizeOptional(request.imageCall(), "imageCall", 2048));
        trainer.setImageStart(normalizeOptional(request.imageStart(), "imageStart", 2048));

        return trainerRepository.save(trainer);
    }

    public Trainer getTrainerById(Long id) {
        validateId(id);
        return trainerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Trainer not found"));
    }

    public void deleteTrainer(Long id) {
        validateId(id);
        if (!trainerRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Trainer not found");
        }
        trainerRepository.deleteById(id);
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "id must be a positive number");
        }
    }

    private String normalizeRequired(String value, String fieldName, int maxLength) {
        if (value == null) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " is required");
        }

        String normalized = value.trim();
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " is required");
        }

        if (normalized.length() > maxLength) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " exceeds max length " + maxLength);
        }

        return normalized;
    }

    private String normalizeOptional(String value, String fieldName, int maxLength) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        if (normalized.isEmpty()) {
            return null;
        }

        if (normalized.length() > maxLength) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " exceeds max length " + maxLength);
        }

        return normalized;
    }

    public CompletableFuture<RecommendWorkoutDTO> getAiRecommendedWorkout(Long trainerId, Long userId) {
        validateId(trainerId);
        validateId(userId);

        // 1. Verify workouts matching this specific trainer exist
        List<Workout> trainerWorkouts = workoutRepository.findByTrainerId(trainerId);
        if (trainerWorkouts.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "No workouts found for trainer ID: " + trainerId);
        }

        // 2. Pull the complete user profile data dependency
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found with ID: " + userId));

        // 3. Fire the non-blocking asynchronous REST pipeline call
        return geminiWorkoutService.recommendWorkoutWithReasoning(user, trainerWorkouts)
                .thenApply(jsonStringResponse -> {
                    try {
                        JsonNode aiResultNode = objectMapper.readTree(jsonStringResponse);

                        // Extract the values using .path() to avoid NullPointerExceptions
                        JsonNode idNode = aiResultNode.path("workoutId");
                        Long workoutId = (idNode.isNull() || idNode.isMissingNode()) ? null : idNode.asLong();
                        String reasoning = aiResultNode.path("reasoning").asText("No reasoning provided.");

                        // 4. Validate entity integrity if a match was successfully found
                        if (workoutId != null && !workoutRepository.existsById(workoutId)) {
                            throw new ResponseStatusException(INTERNAL_SERVER_ERROR,
                                    "AI recommended a workout ID (" + workoutId + ") that does not exist in the database.");
                        }

                        // 5. Build and return your exact custom DTO record payload
                        return new RecommendWorkoutDTO(workoutId, reasoning);

                    } catch (ResponseStatusException rse) {
                        throw rse; // Pass along our validated entity exceptions cleanly
                    } catch (Exception e) {
                        throw new ResponseStatusException(INTERNAL_SERVER_ERROR,
                                "Failed to parse structured AI recommendation payload. Raw response content: " + jsonStringResponse, e);
                    }
                });
    }
}
