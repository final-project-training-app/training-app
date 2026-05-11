package com.example.trainingapp.service;

import com.example.trainingapp.entity.Feedback;
import com.example.trainingapp.entity.UserWorkoutPreferenceType;
import com.example.trainingapp.repository.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserWorkoutPreferenceService preferenceService;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            UserWorkoutPreferenceService preferenceService
    ) {
        this.feedbackRepository = feedbackRepository;
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
}

