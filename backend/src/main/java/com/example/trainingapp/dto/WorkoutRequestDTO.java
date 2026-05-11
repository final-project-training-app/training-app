package com.example.trainingapp.dto;

public record WorkoutRequestDTO(
        Long id,
        String name,
        String instructions,
        Integer level,
        String type,
        Integer durationMinutes,
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
