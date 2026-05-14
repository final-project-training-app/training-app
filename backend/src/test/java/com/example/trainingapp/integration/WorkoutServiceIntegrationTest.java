package com.example.trainingapp.integration;

import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.repository.ActivityLogRepository;
import com.example.trainingapp.repository.WorkoutRepository;
import com.example.trainingapp.service.WorkoutService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Import(WorkoutService.class)
@DisplayName("WorkoutService Integration Tests")
class WorkoutServiceIntegrationTest {

    @Autowired
    private WorkoutService workoutService;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Test
    void createWorkoutPersistsWorkout() {
        Workout workout = new Workout();
        workout.setName("Integration Workout");
        workout.setDurationSeconds(180);

        Workout created = workoutService.createWorkout(workout);

        assertNotNull(created.getId());
        assertTrue(workoutRepository.findById(created.getId()).isPresent());
    }

    @Test
    void startWorkoutReturnsExistingWorkout() {
        Workout workout = new Workout();
        workout.setName("Start Flow");
        workout.setDurationSeconds(90);
        Workout saved = workoutRepository.save(workout);

        Workout started = workoutService.startWorkout(saved.getId(), null);

        assertEquals(saved.getId(), started.getId());
        assertEquals(0, activityLogRepository.findAll().size());
    }
}
