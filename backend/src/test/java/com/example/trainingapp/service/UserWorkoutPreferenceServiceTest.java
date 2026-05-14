package com.example.trainingapp.service;

import com.example.trainingapp.entity.UserWorkoutPreference;
import com.example.trainingapp.entity.UserWorkoutPreferenceType;
import com.example.trainingapp.repository.UserWorkoutPreferenceRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserWorkoutPreferenceService Tests")
class UserWorkoutPreferenceServiceTest {

    @Mock
    private UserWorkoutPreferenceRepository preferenceRepository;

    @InjectMocks
    private UserWorkoutPreferenceService preferenceService;

    @Test
    void getPreferencesReturnsWorkoutIdsByType() {
        UserWorkoutPreference disliked = new UserWorkoutPreference();
        disliked.setWorkoutId(10L);
        UserWorkoutPreference favorite = new UserWorkoutPreference();
        favorite.setWorkoutId(20L);

        when(preferenceRepository.findByUserIdAndPreferenceType(1L, UserWorkoutPreferenceType.DISLIKED)).thenReturn(List.of(disliked));
        when(preferenceRepository.findByUserIdAndPreferenceType(1L, UserWorkoutPreferenceType.FAVORITE)).thenReturn(List.of(favorite));

        Map<String, List<Long>> result = preferenceService.getPreferences(1L);

        assertEquals(List.of(10L), result.get("dislikedWorkoutIds"));
        assertEquals(List.of(20L), result.get("favoriteWorkoutIds"));
    }

    @Test
    void addPreferenceSavesOnlyWhenMissing() {
        when(preferenceRepository.findByUserIdAndWorkoutIdAndPreferenceType(1L, 2L, UserWorkoutPreferenceType.DISLIKED)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any(UserWorkoutPreference.class))).thenAnswer(invocation -> invocation.getArgument(0));

        preferenceService.addPreference(1L, 2L, UserWorkoutPreferenceType.DISLIKED);

        verify(preferenceRepository).save(any(UserWorkoutPreference.class));
    }

    @Test
    void removePreferenceDelegatesToRepository() {
        preferenceService.removePreference(1L, 2L, UserWorkoutPreferenceType.FAVORITE);

        verify(preferenceRepository).deleteByUserIdAndWorkoutIdAndPreferenceType(1L, 2L, UserWorkoutPreferenceType.FAVORITE);
    }
}
