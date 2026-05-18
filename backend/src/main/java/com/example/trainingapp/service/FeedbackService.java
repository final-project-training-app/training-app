package com.example.trainingapp.service;

import com.example.trainingapp.dto.AdminRecentFeedbackDTO;
import com.example.trainingapp.dto.AdminWorkoutFeedbackSummaryDTO;
import com.example.trainingapp.entity.Feedback;
import com.example.trainingapp.entity.FeedbackDifficulty;
import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.entity.UserWorkoutPreferenceType;
import com.example.trainingapp.entity.ActivityLog;
import com.example.trainingapp.repository.ActivityLogRepository;
import com.example.trainingapp.repository.FeedbackRepository;
import com.example.trainingapp.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final WorkoutRepository workoutRepository;
    private final UserWorkoutPreferenceService preferenceService;
    private final ActivityLogRepository activityLogRepository;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            WorkoutRepository workoutRepository,
            UserWorkoutPreferenceService preferenceService,
            ActivityLogRepository activityLogRepository
    ) {
        this.feedbackRepository = feedbackRepository;
        this.workoutRepository = workoutRepository;
        this.preferenceService = preferenceService;
        this.activityLogRepository = activityLogRepository;
    }

    public Feedback saveFeedback(Feedback feedback) {
        validateFeedback(feedback);
        attachActivityLog(feedback);
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

        Long activityLogId = feedback.getActivityLogId();
        if (activityLogId != null) {
            ActivityLog activityLog = activityLogRepository.findById(activityLogId)
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "activityLogId does not exist"));

            if (!Objects.equals(activityLog.getUserId(), feedback.getUserId())
                    || !Objects.equals(activityLog.getWorkoutId(), feedback.getWorkoutId())) {
                throw new ResponseStatusException(BAD_REQUEST, "activityLogId must match userId and workoutId");
            }
        }
    }

    private void attachActivityLog(Feedback feedback) {
        if (feedback.getActivityLogId() != null) {
            return;
        }

        Long userId = feedback.getUserId();
        Long workoutId = feedback.getWorkoutId();

        Optional<Long> matchedActivityLogId = activityLogRepository
                .findTopByUserIdAndWorkoutIdAndStatusOrderByCompletedAtDesc(userId, workoutId, "COMPLETED")
                .or(() -> activityLogRepository.findTopByUserIdAndWorkoutIdOrderByCompletedAtDesc(userId, workoutId))
                .map(ActivityLog::getId);

        if (matchedActivityLogId.isPresent()) {
            feedback.setActivityLogId(matchedActivityLogId.get());
            return;
        }

        // Fallback: create a synthetic completed log so feedback is always traceable to a session row.
        ActivityLog fallbackLog = new ActivityLog();
        fallbackLog.setUserId(userId);
        fallbackLog.setWorkoutId(workoutId);
        fallbackLog.setStatus("COMPLETED");
        fallbackLog.setCompletedAt(LocalDateTime.now());
        ActivityLog savedLog = activityLogRepository.save(fallbackLog);
        feedback.setActivityLogId(savedLog.getId());
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

    public List<AdminWorkoutFeedbackSummaryDTO> getWorkoutFeedbackSummary() {
        List<Workout> workouts = workoutRepository.findAll();
        List<Feedback> feedbacks = feedbackRepository.findAll();

        java.util.Map<Long, List<Feedback>> feedbackByWorkoutId = new java.util.HashMap<>();
        for (Feedback feedback : feedbacks) {
            if (feedback.getWorkoutId() == null) {
                continue;
            }
            feedbackByWorkoutId
                    .computeIfAbsent(feedback.getWorkoutId(), ignored -> new ArrayList<>())
                    .add(feedback);
        }

        List<AdminWorkoutFeedbackSummaryDTO> summary = new ArrayList<>();
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

            summary.add(new AdminWorkoutFeedbackSummaryDTO(
                    workout.getId(),
                    workout.getName(),
                    feedbackCount,
                    avgRating,
                    dislikeRate,
                    tooHardRate,
                    deriveStatus(feedbackCount, avgRating, dislikeRate, tooHardRate)
            ));
        }

        return summary;
    }

    public List<AdminRecentFeedbackDTO> getRecentFeedbackEntries() {
        List<Feedback> feedbacks = new ArrayList<>(feedbackRepository.findAll());
        feedbacks.sort(Comparator.comparing(Feedback::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));

        List<AdminRecentFeedbackDTO> result = new ArrayList<>();
        for (Feedback feedback : feedbacks) {
            String workoutName = workoutRepository.findById(feedback.getWorkoutId())
                    .map(Workout::getName)
                    .orElse("Unknown workout");

            result.add(new AdminRecentFeedbackDTO(
                    feedback.getId(),
                    feedback.getUserId(),
                    feedback.getWorkoutId(),
                    feedback.getActivityLogId(),
                    workoutName,
                    feedback.getDifficulty(),
                    feedback.getLiked(),
                    feedback.getRating(),
                    feedback.getComment(),
                    feedback.getCreatedAt()
            ));
        }

        return result;
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

