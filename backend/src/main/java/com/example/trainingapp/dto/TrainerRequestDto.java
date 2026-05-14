package com.example.trainingapp.dto;

public record TrainerRequestDto(
    String name,
    String prompt,
    String voice,
    String intro,
    String language,
    String imageSelect,
    String imageCall,
    String imageStart
) {}