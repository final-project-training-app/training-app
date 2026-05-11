package com.example.trainingapp.repository;

import com.example.trainingapp.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUserId(Long userId);

    List<Feedback> findByWorkoutId(Long workoutId);

    List<Feedback> findByUserIdAndWorkoutId(Long userId, Long workoutId);
}
