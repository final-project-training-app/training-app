package com.example.trainingapp.service;

import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class WorkoutService {

    private final WorkoutRepository workoutRepository;

    public WorkoutService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    public String getWorkoutAudioUrl(Long id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Workout not found"));

        if (workout.getWorkoutAudio() == null || workout.getWorkoutAudio().isBlank()) {
            throw new ResponseStatusException(NOT_FOUND, "Workout audio not found");
        }

        return workout.getWorkoutAudio();
    }

    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    public Workout getWorkoutById(Long id) {
        return workoutRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Workout not found"));
    }
}

