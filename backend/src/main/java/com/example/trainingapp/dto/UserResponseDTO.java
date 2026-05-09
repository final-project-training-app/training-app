package com.example.trainingapp.dto;

public record UserResponseDTO(
    String name,
    int intensityLevel,
    String context,
    boolean isAdmin
) {}