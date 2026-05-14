package com.example.trainingapp.repository;

import com.example.trainingapp.entity.UserWorkoutPreference;
import com.example.trainingapp.entity.UserWorkoutPreferenceType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("UserWorkoutPreferenceRepository Tests")
class UserWorkoutPreferenceRepositoryTest {

    @Autowired
    private UserWorkoutPreferenceRepository preferenceRepository;

    @Test
    void saveAndQueryPreferenceWork() {
        UserWorkoutPreference preference = new UserWorkoutPreference();
        preference.setUserId(1L);
        preference.setWorkoutId(2L);
        preference.setPreferenceType(UserWorkoutPreferenceType.DISLIKED);

        preferenceRepository.save(preference);

        assertTrue(preferenceRepository.findByUserIdAndWorkoutIdAndPreferenceType(1L, 2L, UserWorkoutPreferenceType.DISLIKED).isPresent());
    }
}
