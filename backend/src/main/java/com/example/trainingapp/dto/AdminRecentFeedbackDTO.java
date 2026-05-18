package com.example.trainingapp.dto;

import com.example.trainingapp.entity.FeedbackDifficulty;

import java.time.LocalDateTime;

public record AdminRecentFeedbackDTO(
        Long id,
        Long userId,
        Long workoutId,
        Long activityLogId,
        String workoutName,
        FeedbackDifficulty difficulty,
        Boolean liked,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
}

