package com.example.trainingapp.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("UserResponseDTO Tests")
class UserResponseDTOTest {

    @Test
    void recordStoresValues() {
        UserResponseDTO dto = new UserResponseDTO("Jane", 4, "context", true, 7L);

        assertEquals("Jane", dto.name());
        assertEquals(4, dto.intensityLevel());
        assertEquals("context", dto.context());
        assertTrue(dto.isAdmin());
        assertEquals(7L, dto.trainerId());
    }
}
