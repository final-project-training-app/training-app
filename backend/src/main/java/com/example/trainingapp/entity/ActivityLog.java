package com.example.trainingapp.entity;

import java.time.LocalDateTime;

public class ActivityLog {
    private Long id;
    private Long userId;
    private Long workoutId;
    private LocalDateTime completedAt;
    private Integer durationSeconds;
    private String feedback;
    private String status;
}