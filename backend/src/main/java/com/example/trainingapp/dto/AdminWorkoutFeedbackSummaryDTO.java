package com.example.trainingapp.dto;

public record AdminWorkoutFeedbackSummaryDTO(
        Long workoutId,
        String workoutName,
        int feedbackCount,
        double avgRating,
        double dislikeRate,
        double tooHardRate,
        String status
) {
}

