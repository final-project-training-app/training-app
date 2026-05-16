package com.example.trainingapp.repository;

import com.example.trainingapp.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
	List<ActivityLog> findByUserIdAndStatusOrderByCompletedAtDesc(Long userId, String status);

	Optional<ActivityLog> findTopByUserIdAndWorkoutIdAndStatusOrderByCompletedAtDesc(Long userId, Long workoutId, String status);

	Optional<ActivityLog> findTopByUserIdAndWorkoutIdOrderByCompletedAtDesc(Long userId, Long workoutId);
}
