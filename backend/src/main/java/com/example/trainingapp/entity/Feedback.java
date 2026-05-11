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

import java.time.LocalDateTime;

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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getWorkoutId() {
        return workoutId;
    }

    public void setWorkoutId(Long workoutId) {
        this.workoutId = workoutId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Long getActivityLogId() {
        return activityLogId;
    }

    public void setActivityLogId(Long activityLogId) {
        this.activityLogId = activityLogId;
    }

    public FeedbackDifficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(FeedbackDifficulty difficulty) {
        this.difficulty = difficulty;
    }

    public Boolean getLiked() {
        return liked;
    }

    public void setLiked(Boolean liked) {
        this.liked = liked;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
