package com.example.trainingapp.dto;

public record UserRequestDTO(
    String name,
    int intensityLevel,
    String context
) {}