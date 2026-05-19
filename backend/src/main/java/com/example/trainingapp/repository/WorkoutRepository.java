package com.example.trainingapp.repository;

import com.example.trainingapp.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    List<Workout> findByTrainerId(Long trainerId);
}

