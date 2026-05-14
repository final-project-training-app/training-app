package com.example.trainingapp.service;

import com.example.trainingapp.dto.WorkoutResponseDTO;
import com.example.trainingapp.entity.ActivityLog;
import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.repository.ActivityLogRepository;
import com.example.trainingapp.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

    @Transactional
    public List<WorkoutResponseDTO> getAllWorkouts() {
        return workoutRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkoutResponseDTO getWorkoutById(Long id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Workout not found"));

        return mapToResponse(workout);
    }

    @Transactional
    public WorkoutResponseDTO startWorkout(Long id, Long userId) {
        // Reuse the logic from getWorkoutById to ensure mapping and session handling
        WorkoutResponseDTO workout = getWorkoutById(id);

        if (userId != null) {
            ActivityLog activityLog = new ActivityLog();
            activityLog.setUserId(userId);
            activityLog.setWorkoutId(workout.id()); // Record uses accessor style
            activityLog.setStatus("STARTED");
            activityLog.setCompletedAt(LocalDateTime.now());
            activityLogRepository.save(activityLog);
        }

        return workout;
    }

    @Transactional
    public WorkoutResponseDTO createWorkout(Workout workout) {
        validateWorkoutForWrite(workout);
        Workout saved = workoutRepository.save(workout);
        return mapToResponse(saved);
    }

    @Transactional
    public WorkoutResponseDTO updateWorkout(Long id, Workout workout) {
        validateId(id);
        validateWorkoutForWrite(workout);

        Workout existing = workoutRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Workout not found"));

        workout.setId(existing.getId());
        Workout updated = workoutRepository.save(workout);
        return mapToResponse(updated);
    }

    public void deleteWorkout(Long id) {
        validateId(id);

        if (!workoutRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Workout not found");
        }

        workoutRepository.deleteById(id);
    }

    private WorkoutResponseDTO mapToResponse(Workout workout) {
        WorkoutResponseDTO.TrainerIdDTO trainerDTO = null;

        // This is where the @Transactional is key:
        // It keeps the session open to check if a trainer exists and get their ID.
        if (workout.getTrainer() != null) {
            trainerDTO = new WorkoutResponseDTO.TrainerIdDTO(workout.getTrainer().getId());
        }

        return new WorkoutResponseDTO(
                workout.getId(),
                workout.getName(),
                workout.getDescription(),
                workout.getLevel(),
                workout.getType(),
                workout.getDurationSeconds(),
                workout.getInstructionsAudio(),
                workout.getWorkoutAudio(),
                workout.getInstructionsImage(),
                workout.getWorkoutImage(),
                workout.getKneeFriendly(),
                workout.getLowImpact(),
                workout.getSeated(),
                workout.getBeginnerFriendly(),
                trainerDTO
        );
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