package com.example.trainingapp.dto;

public record UserResponseDTO(
        Long id,
        String name,
        int intensityLevel,
        String context,
        boolean isAdmin,
        Long trainerId
) {
}