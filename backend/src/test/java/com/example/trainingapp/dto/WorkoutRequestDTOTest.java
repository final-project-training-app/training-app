package com.example.trainingapp.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("WorkoutRequestDTO Tests")
class WorkoutRequestDTOTest {

    @Test
    void recordStoresValues() {
        WorkoutRequestDTO dto = new WorkoutRequestDTO(
                "Push Ups",
                "Upper body",
                1,
                "strength",
                300,
                "instructions.mp3",
                "workout.mp3",
                "instructions.png",
                "workout.png",
                null,
                null,
                null,
                true,
                false,
                false,
                true,
                new WorkoutRequestDTO.TrainerIdDTO(7L)
        );

        assertEquals("Push Ups", dto.name());
        assertEquals(300, dto.durationSeconds());
        assertTrue(dto.beginnerFriendly());
        assertEquals(7L, dto.trainer().id());
    }
}
