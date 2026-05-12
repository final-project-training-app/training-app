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
        Boolean kneeFriendly,
        Boolean lowImpact,
        Boolean seated,
        Boolean beginnerFriendly
) {
}
