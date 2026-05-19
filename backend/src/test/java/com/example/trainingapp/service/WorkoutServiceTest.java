package com.example.trainingapp.service;

import com.example.trainingapp.entity.ActivityLog;
import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.repository.ActivityLogRepository;
import com.example.trainingapp.repository.WorkoutRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WorkoutService Tests")
class WorkoutServiceTest {

    @Mock
    private WorkoutRepository workoutRepository;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @InjectMocks
    private WorkoutService workoutService;

    private Workout workout;

    @BeforeEach
    void setUp() {
        workout = new Workout();
        workout.setId(1L);
        workout.setName("Push Ups");
        workout.setDurationSeconds(300);
        workout.setWorkoutAudio("audio.mp3");
    }

    @Test
    void getWorkoutAudioUrlReturnsAudio() {
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(workout));

        assertEquals("audio.mp3", workoutService.getWorkoutAudioUrl(1L));
    }

    @Test
    void getWorkoutAudioUrlThrowsWhenMissingAudio() {
        workout.setWorkoutAudio(" ");
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(workout));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> workoutService.getWorkoutAudioUrl(1L));
        assertEquals("Workout audio not found", ex.getReason());
    }

    @Test
    void getAllWorkoutsReturnsRepositoryResults() {
        when(workoutRepository.findAll()).thenReturn(List.of(workout));

        assertEquals(1, workoutService.getAllWorkouts(true).size());
    }

    @Test
    void startWorkoutCreatesActivityLogWhenUserPresent() {
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(workout));
        when(activityLogRepository.save(any(ActivityLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        workoutService.startWorkout(1L, 55L);

        ArgumentCaptor<ActivityLog> captor = ArgumentCaptor.forClass(ActivityLog.class);
        verify(activityLogRepository).save(captor.capture());
        assertEquals(55L, captor.getValue().getUserId());
        assertEquals(1L, captor.getValue().getWorkoutId());
        assertEquals("STARTED", captor.getValue().getStatus());
    }

    @Test
    void createWorkoutRejectsBlankName() {
        workout.setName(" ");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> workoutService.createWorkout(workout));
        assertEquals("Workout name is required", ex.getReason());
    }

    @Test
    void updateWorkoutRejectsInvalidId() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> workoutService.updateWorkout(0L, workout));
        assertEquals("id must be a positive number", ex.getReason());
    }

    @Test
    void deleteWorkoutDeletesExistingWorkout() {
        when(workoutRepository.existsById(1L)).thenReturn(true);

        workoutService.deleteWorkout(1L);

        verify(workoutRepository).deleteById(1L);
    }
}
