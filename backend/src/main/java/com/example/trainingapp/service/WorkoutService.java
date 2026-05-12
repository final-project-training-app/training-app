package com.example.trainingapp.service;

import com.example.trainingapp.entity.ActivityLog;
import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.repository.ActivityLogRepository;
import com.example.trainingapp.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final ActivityLogRepository activityLogRepository;

    public WorkoutService(WorkoutRepository workoutRepository, ActivityLogRepository activityLogRepository) {
        this.workoutRepository = workoutRepository;
        this.activityLogRepository = activityLogRepository;
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

    public Workout startWorkout(Long id, Long userId) {
        Workout workout = getWorkoutById(id);

        if (userId != null) {
            ActivityLog activityLog = new ActivityLog();
            activityLog.setUserId(userId);
            activityLog.setWorkoutId(workout.getId());
            activityLog.setStatus("STARTED");
            activityLog.setCompletedAt(LocalDateTime.now());
            activityLogRepository.save(activityLog);
        }

        return workout;
    }

    public Workout createWorkout(Workout workout) {
        validateWorkoutForWrite(workout);
        return workoutRepository.save(workout);
    }

    public Workout updateWorkout(Long id, Workout workout) {
        validateId(id);
        validateWorkoutForWrite(workout);

        Workout existing = workoutRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Workout not found"));

        workout.setId(existing.getId());
        return workoutRepository.save(workout);
    }

    public void deleteWorkout(Long id) {
        validateId(id);

        if (!workoutRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Workout not found");
        }

        workoutRepository.deleteById(id);
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "id must be a positive number");
        }
    }

    private void validateWorkoutForWrite(Workout workout) {
        if (workout == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Workout body is required");
        }

        if (workout.getName() == null || workout.getName().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Workout name is required");
        }

        Integer durationSeconds = workout.getDurationSeconds();
        if (durationSeconds != null && durationSeconds < 0) {
            throw new ResponseStatusException(BAD_REQUEST, "durationSeconds cannot be negative");
        }
    }

}
