package com.example.trainingapp.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_workout_preferences", indexes = {
        @Index(name = "idx_user_workout_pref_user_id", columnList = "userId"),
        @Index(name = "idx_user_workout_pref_workout_id", columnList = "workoutId")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_workout_pref", columnNames = {"userId", "workoutId", "preferenceType"})
})
public class UserWorkoutPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long workoutId;

    @Enumerated(EnumType.STRING)
    private UserWorkoutPreferenceType preferenceType;

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

    public UserWorkoutPreferenceType getPreferenceType() {
        return preferenceType;
    }

    public void setPreferenceType(UserWorkoutPreferenceType preferenceType) {
        this.preferenceType = preferenceType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

