package com.example.trainingapp.service;

import com.example.trainingapp.entity.UserWorkoutPreference;
import com.example.trainingapp.entity.UserWorkoutPreferenceType;
import com.example.trainingapp.repository.UserWorkoutPreferenceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserWorkoutPreferenceService {

    private final UserWorkoutPreferenceRepository preferenceRepository;

    public UserWorkoutPreferenceService(UserWorkoutPreferenceRepository preferenceRepository) {
        this.preferenceRepository = preferenceRepository;
    }

    public Map<String, List<Long>> getPreferences(Long userId) {
        List<Long> dislikedWorkoutIds = preferenceRepository
                .findByUserIdAndPreferenceType(userId, UserWorkoutPreferenceType.DISLIKED)
                .stream()
                .map(UserWorkoutPreference::getWorkoutId)
                .toList();

        List<Long> favoriteWorkoutIds = preferenceRepository
                .findByUserIdAndPreferenceType(userId, UserWorkoutPreferenceType.FAVORITE)
                .stream()
                .map(UserWorkoutPreference::getWorkoutId)
                .toList();

        Map<String, List<Long>> response = new HashMap<>();
        response.put("dislikedWorkoutIds", dislikedWorkoutIds);
        response.put("favoriteWorkoutIds", favoriteWorkoutIds);
        return response;
    }

    public void addPreference(Long userId, Long workoutId, UserWorkoutPreferenceType preferenceType) {
        boolean exists = preferenceRepository
                .findByUserIdAndWorkoutIdAndPreferenceType(userId, workoutId, preferenceType)
                .isPresent();

        if (exists) {
            return;
        }

        UserWorkoutPreference preference = new UserWorkoutPreference();
        preference.setUserId(userId);
        preference.setWorkoutId(workoutId);
        preference.setPreferenceType(preferenceType);
        preference.setCreatedAt(LocalDateTime.now());
        preferenceRepository.save(preference);
    }

    public void removePreference(Long userId, Long workoutId, UserWorkoutPreferenceType preferenceType) {
        preferenceRepository.deleteByUserIdAndWorkoutIdAndPreferenceType(userId, workoutId, preferenceType);
    }
}

