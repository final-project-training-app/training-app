package com.example.trainingapp.service;

import com.example.trainingapp.entity.ActivityLog;
import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.repository.ActivityLogRepository;
import com.example.trainingapp.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

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

    public Long recommendWorkout(Map<String, Object> filters) {
        List<Workout> workouts = workoutRepository.findAll();

        Integer level = filters.get("level") != null
                ? (Integer) filters.get("level")
                : null;

        Boolean kneeFriendly = (Boolean) filters.get("kneeFriendly");
        Boolean lowImpact = (Boolean) filters.get("lowImpact");
        Boolean seated = (Boolean) filters.get("seated");
        Boolean beginnerFriendly = (Boolean) filters.get("beginnerFriendly");

        return workouts.stream()
                .filter(w -> level == null || w.getLevel() <= level)
                .filter(w -> kneeFriendly == null || kneeFriendly.equals(w.getKneeFriendly()))
                .filter(w -> lowImpact == null || lowImpact.equals(w.getLowImpact()))
                .filter(w -> seated == null || seated.equals(w.getSeated()))
                .filter(w -> beginnerFriendly == null || beginnerFriendly.equals(w.getBeginnerFriendly()))
                .min(Comparator.comparing(Workout::getLevel))
                .orElseThrow(() -> new RuntimeException("No matching workout found"))
                .getId();
    }
}
