package com.example.trainingapp.dto;

public record WorkoutResponseDTO(
        Long id,
        String name,
        String description,
        String dashboardName,
        String dashboardDescription,
        Integer level,
        String type,
        Integer durationSeconds,
        String instructionsAudio,
        String workoutAudio,
        String instructionsImage,
        String workoutImage,
        String instructionsVideo,
        Integer instructionsVideoStart,
        Integer instructionsVideoStop,
        Boolean kneeFriendly,
        Boolean lowImpact,
        Boolean seated,
        Boolean beginnerFriendly,
        Boolean enabled,
        TrainerIdDTO trainer
) {
    public record TrainerIdDTO(Long id) {
    }
}