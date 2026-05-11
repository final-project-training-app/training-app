package com.example.trainingapp.service;

import com.example.trainingapp.entity.ActivityLog;
import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.repository.ActivityLogRepository;
import com.example.trainingapp.repository.WorkoutRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final WorkoutRepository workoutRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository, WorkoutRepository workoutRepository) {
        this.activityLogRepository = activityLogRepository;
        this.workoutRepository = workoutRepository;
    }

    public ActivityLog createActivityLog(ActivityLog activityLog) {
        activityLog.setCompletedAt(LocalDateTime.now());
        return activityLogRepository.save(activityLog);
    }

    public ActivityLog completeActivityLog(Long id) {
        ActivityLog log = activityLogRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "ActivityLog not found"));
        log.setStatus("COMPLETED");
        log.setCompletedAt(LocalDateTime.now());
        return activityLogRepository.save(log);
    }

    public Map<String, Object> getUserProgress(Long userId) {
        List<ActivityLog> completedLogs = activityLogRepository
                .findByUserIdAndStatusOrderByCompletedAtDesc(userId, "COMPLETED");

        Map<Long, String> workoutNameById = new HashMap<>();
        Map<LocalDate, LinkedHashSet<String>> workoutsByDate = new LinkedHashMap<>();
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("EEEE d MMMM", Locale.ENGLISH);

        for (ActivityLog log : completedLogs) {
            if (log.getCompletedAt() == null) {
                continue;
            }

            Long workoutId = log.getWorkoutId();
            String workoutName = workoutNameById.get(workoutId);

            if (workoutName == null) {
                Optional<Workout> workout = workoutRepository.findById(workoutId);
                workoutName = workout.map(Workout::getName).orElse("Unknown workout");
                workoutNameById.put(workoutId, workoutName);
            }

            LocalDate completedDate = log.getCompletedAt().toLocalDate();
            workoutsByDate
                    .computeIfAbsent(completedDate, ignored -> new LinkedHashSet<>())
                    .add(workoutName);
        }

        List<Map<String, Object>> completedWorkouts = new ArrayList<>();
        for (Map.Entry<LocalDate, LinkedHashSet<String>> entry : workoutsByDate.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("dateLabel", entry.getKey().format(labelFormatter));
            item.put("workoutName", String.join(", ", entry.getValue()));
            completedWorkouts.add(item);
        }

        int currentStreak = calculateCurrentStreak(new ArrayList<>(workoutsByDate.keySet()));

        Map<String, Object> response = new HashMap<>();
        response.put("currentStreak", currentStreak);
        response.put("completedWorkouts", completedWorkouts);
        return response;
    }

    private int calculateCurrentStreak(List<LocalDate> dates) {
        if (dates.isEmpty()) {
            return 0;
        }

        int streak = 1;
        for (int i = 1; i < dates.size(); i++) {
            LocalDate previousDay = dates.get(i - 1).minusDays(1);
            if (dates.get(i).isEqual(previousDay)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }
}
