package com.example.trainingapp.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("UserRequestDTO Tests")
class UserRequestDTOTest {

    @Test
    void recordStoresValues() {
        UserRequestDTO dto = new UserRequestDTO("Jane", 4, "context", 1L);

        assertEquals("Jane", dto.name());
        assertEquals(4, dto.intensityLevel());
        assertEquals("context", dto.context());
        assertEquals(1L, dto.trainerId());
    }
}
