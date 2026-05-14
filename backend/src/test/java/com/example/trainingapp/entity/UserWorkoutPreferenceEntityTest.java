package com.example.trainingapp.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("UserWorkoutPreference Entity Tests")
class UserWorkoutPreferenceEntityTest {

    @Test
    void settersAndGettersWork() {
        UserWorkoutPreference preference = new UserWorkoutPreference();
        preference.setUserId(1L);
        preference.setWorkoutId(2L);
        preference.setPreferenceType(UserWorkoutPreferenceType.FAVORITE);

        assertEquals(1L, preference.getUserId());
        assertEquals(2L, preference.getWorkoutId());
        assertEquals(UserWorkoutPreferenceType.FAVORITE, preference.getPreferenceType());
    }
}
