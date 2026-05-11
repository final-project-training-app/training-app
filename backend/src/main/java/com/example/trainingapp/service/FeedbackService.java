package com.example.trainingapp.service;

import com.example.trainingapp.entity.Feedback;
import com.example.trainingapp.entity.FeedbackDifficulty;
import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.entity.UserWorkoutPreferenceType;
import com.example.trainingapp.repository.FeedbackRepository;
import com.example.trainingapp.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final WorkoutRepository workoutRepository;
    private final UserWorkoutPreferenceService preferenceService;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            WorkoutRepository workoutRepository,
            UserWorkoutPreferenceService preferenceService
    ) {
        this.feedbackRepository = feedbackRepository;
        this.workoutRepository = workoutRepository;
        this.preferenceService = preferenceService;
    }

    public Feedback saveFeedback(Feedback feedback) {
        validateFeedback(feedback);
        feedback.setCreatedAt(LocalDateTime.now());
        Feedback savedFeedback = feedbackRepository.save(feedback);

        if (Boolean.FALSE.equals(feedback.getLiked())) {
            preferenceService.addPreference(
                    feedback.getUserId(),
                    feedback.getWorkoutId(),
                    UserWorkoutPreferenceType.DISLIKED
            );
        }

        if (Boolean.TRUE.equals(feedback.getLiked())) {
            preferenceService.removePreference(
                    feedback.getUserId(),
                    feedback.getWorkoutId(),
                    UserWorkoutPreferenceType.DISLIKED
            );
        }

        return savedFeedback;
    }

    private void validateFeedback(Feedback feedback) {
        if (feedback.getUserId() == null || feedback.getWorkoutId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "userId and workoutId are required");
        }

        Integer rating = feedback.getRating();
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new ResponseStatusException(BAD_REQUEST, "rating must be between 1 and 5");
        }

        if (feedback.getDifficulty() == null && rating == null && feedback.getLiked() == null) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "at least one of difficulty, liked, or rating must be provided"
            );
        }
    }

    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    public List<Feedback> getFeedbackByUserId(Long userId) {
        return feedbackRepository.findByUserId(userId);
    }

    public List<Feedback> getFeedbackByWorkoutId(Long workoutId) {
        return feedbackRepository.findByWorkoutId(workoutId);
    }

    public List<Feedback> getFeedbackByUserAndWorkout(Long userId, Long workoutId) {
        return feedbackRepository.findByUserIdAndWorkoutId(userId, workoutId);
    }

    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }

    public List<Map<String, Object>> getWorkoutFeedbackSummary() {
        List<Workout> workouts = workoutRepository.findAll();
        List<Feedback> feedbacks = feedbackRepository.findAll();

        Map<Long, List<Feedback>> feedbackByWorkoutId = new HashMap<>();
        for (Feedback feedback : feedbacks) {
            if (feedback.getWorkoutId() == null) {
                continue;
            }
            feedbackByWorkoutId
                    .computeIfAbsent(feedback.getWorkoutId(), ignored -> new ArrayList<>())
                    .add(feedback);
        }

        List<Map<String, Object>> summary = new ArrayList<>();
        for (Workout workout : workouts) {
            List<Feedback> workoutFeedback = feedbackByWorkoutId.getOrDefault(workout.getId(), List.of());
            int feedbackCount = workoutFeedback.size();

            int ratingCount = 0;
            double ratingSum = 0;
            int dislikedCount = 0;
            int tooHardCount = 0;

            for (Feedback feedback : workoutFeedback) {
                if (feedback.getRating() != null) {
                    ratingSum += feedback.getRating();
                    ratingCount++;
                }

                if (Boolean.FALSE.equals(feedback.getLiked())) {
                    dislikedCount++;
                }

                if (feedback.getDifficulty() == FeedbackDifficulty.TOO_HARD) {
                    tooHardCount++;
                }
            }

            double avgRating = ratingCount == 0 ? 0 : roundTwoDecimals(ratingSum / ratingCount);
            double dislikeRate = feedbackCount == 0 ? 0 : roundTwoDecimals((double) dislikedCount / feedbackCount);
            double tooHardRate = feedbackCount == 0 ? 0 : roundTwoDecimals((double) tooHardCount / feedbackCount);

            Map<String, Object> item = new HashMap<>();
            item.put("workoutId", workout.getId());
            item.put("workoutName", workout.getName());
            item.put("feedbackCount", feedbackCount);
            item.put("avgRating", avgRating);
            item.put("dislikeRate", dislikeRate);
            item.put("tooHardRate", tooHardRate);
            item.put("status", deriveStatus(feedbackCount, avgRating, dislikeRate, tooHardRate));
            summary.add(item);
        }

        return summary;
    }

    private String deriveStatus(int feedbackCount, double avgRating, double dislikeRate, double tooHardRate) {
        if (feedbackCount < 3) {
            return "NEEDS_REVIEW";
        }

        if (dislikeRate >= 0.40 || tooHardRate >= 0.50 || (avgRating > 0 && avgRating < 2.80)) {
            return "BAD";
        }

        if (avgRating >= 4.0 && dislikeRate <= 0.20 && tooHardRate <= 0.30) {
            return "GOOD";
        }

        return "NEEDS_REVIEW";
    }

    private double roundTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

