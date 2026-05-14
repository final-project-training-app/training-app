package com.example.trainingapp.repository;

import com.example.trainingapp.entity.Workout;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("WorkoutRepository Tests")
class WorkoutRepositoryTest {

    @Autowired
    private WorkoutRepository workoutRepository;

    @Test
    void saveAndFindByIdWork() {
        Workout workout = new Workout();
        workout.setName("Push Ups");
        workout.setDurationSeconds(120);

        Workout saved = workoutRepository.save(workout);

        assertNotNull(saved.getId());
        assertTrue(workoutRepository.findById(saved.getId()).isPresent());
    }
}
