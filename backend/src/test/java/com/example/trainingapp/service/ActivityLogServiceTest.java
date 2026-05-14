package com.example.trainingapp.service;

import com.example.trainingapp.entity.ActivityLog;
import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.repository.ActivityLogRepository;
import com.example.trainingapp.repository.WorkoutRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ActivityLogService Tests")
class ActivityLogServiceTest {

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private WorkoutRepository workoutRepository;

    @InjectMocks
    private ActivityLogService activityLogService;

    @Test
    void createActivityLogAddsTimestamp() {
        ActivityLog log = new ActivityLog();
        when(activityLogRepository.save(any(ActivityLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ActivityLog saved = activityLogService.createActivityLog(log);

        assertNotNull(saved.getCompletedAt());
    }

    @Test
    void completeActivityLogThrowsWhenMissing() {
        when(activityLogRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> activityLogService.completeActivityLog(1L));
        assertEquals("ActivityLog not found", ex.getReason());
    }

    @Test
    void getUserProgressReturnsZeroWhenNoLogsExist() {
        when(activityLogRepository.findByUserIdAndStatusOrderByCompletedAtDesc(1L, "COMPLETED")).thenReturn(List.of());

        Map<String, Object> progress = activityLogService.getUserProgress(1L);

        assertEquals(0, progress.get("currentStreak"));
    }

    @Test
    void getUserProgressBuildsCompletedWorkouts() {
        ActivityLog log = new ActivityLog();
        log.setUserId(1L);
        log.setWorkoutId(7L);
        log.setStatus("COMPLETED");
        log.setCompletedAt(LocalDateTime.now());

        Workout workout = new Workout();
        workout.setId(7L);
        workout.setName("Squats");

        when(activityLogRepository.findByUserIdAndStatusOrderByCompletedAtDesc(1L, "COMPLETED")).thenReturn(List.of(log));
        when(workoutRepository.findById(7L)).thenReturn(Optional.of(workout));

        Map<String, Object> progress = activityLogService.getUserProgress(1L);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> completed = (List<Map<String, Object>>) progress.get("completedWorkouts");

        assertEquals(1, completed.size());
        assertEquals("Squats", completed.get(0).get("workoutName"));
    }
}
