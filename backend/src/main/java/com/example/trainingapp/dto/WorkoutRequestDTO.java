package com.example.trainingapp.dto;

public record WorkoutRequestDTO(
        String name,
        String description,
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
        TrainerIdDTO trainer
) {
    public record TrainerIdDTO(Long id) {
    }
}
