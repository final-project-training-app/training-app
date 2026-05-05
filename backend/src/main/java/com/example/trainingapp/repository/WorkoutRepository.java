package com.example.trainingapp.repository;

import com.example.trainingapp.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
}

