package com.example.trainingapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(indexes = {
        @Index(name = "idx_feedback_user_id", columnList = "userId"),
        @Index(name = "idx_feedback_workout_id", columnList = "workoutId"),
        @Index(name = "idx_feedback_activity_log_id", columnList = "activityLogId")
})
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long workoutId;

    private Long activityLogId;

    @Enumerated(EnumType.STRING)
    private FeedbackDifficulty difficulty;

    private Boolean liked;

    private Integer rating;

    @Column(length = 500)
    private String comment;

    private LocalDateTime createdAt;
}
