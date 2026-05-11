package com.example.trainingapp.repository;

import com.example.trainingapp.entity.UserWorkoutPreference;
import com.example.trainingapp.entity.UserWorkoutPreferenceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserWorkoutPreferenceRepository extends JpaRepository<UserWorkoutPreference, Long> {
    List<UserWorkoutPreference> findByUserIdAndPreferenceType(Long userId, UserWorkoutPreferenceType preferenceType);

    Optional<UserWorkoutPreference> findByUserIdAndWorkoutIdAndPreferenceType(
            Long userId,
            Long workoutId,
            UserWorkoutPreferenceType preferenceType
    );

    void deleteByUserIdAndWorkoutIdAndPreferenceType(Long userId, Long workoutId, UserWorkoutPreferenceType preferenceType);
}

