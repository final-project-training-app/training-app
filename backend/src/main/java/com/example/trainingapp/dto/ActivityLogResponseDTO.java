package com.example.trainingapp.dto;

import java.time.LocalDateTime;

public record ActivityLogResponseDTO(
        Long id,
        Long userId,
        Long workoutId,
        LocalDateTime completedAt,
        Integer durationSeconds,
        String feedback,
        String status
) {
}

