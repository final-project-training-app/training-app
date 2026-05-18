package com.example.trainingapp.dto;

import com.example.trainingapp.entity.FeedbackDifficulty;

public record FeedbackRequestDTO(
        Long userId,
        Long workoutId,
        Long activityLogId,
        FeedbackDifficulty difficulty,
        Boolean liked,
        Integer rating,
        String comment
) {
}

