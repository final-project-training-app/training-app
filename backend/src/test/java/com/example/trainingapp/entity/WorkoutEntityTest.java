package com.example.trainingapp.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Workout Entity Tests")
class WorkoutEntityTest {

    @Test
    void durationSecondsRejectsNegativeValues() {
        Workout workout = new Workout();

        assertThrows(IllegalArgumentException.class, () -> workout.setDurationSeconds(-1));
    }

    @Test
    void durationSecondsAcceptsNullAndPositiveValues() {
        Workout workout = new Workout();
        workout.setDurationSeconds(null);
        workout.setDurationSeconds(120);

        assertEquals(120, workout.getDurationSeconds());
    }
}
