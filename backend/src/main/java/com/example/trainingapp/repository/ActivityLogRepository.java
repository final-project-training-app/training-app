package com.example.trainingapp.repository;

import com.example.trainingapp.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
	List<ActivityLog> findByUserIdAndStatusOrderByCompletedAtDesc(Long userId, String status);

	Optional<ActivityLog> findTopByUserIdAndWorkoutIdAndStatusOrderByCompletedAtDesc(Long userId, Long workoutId, String status);

	Optional<ActivityLog> findTopByUserIdAndWorkoutIdOrderByCompletedAtDesc(Long userId, Long workoutId);

	boolean existsByUserIdAndStatusAndCompletedAtBetween(Long userId, String status, LocalDateTime start, LocalDateTime end);

	@Query("SELECT COUNT(DISTINCT a.userId) FROM ActivityLog a WHERE a.status = 'COMPLETED' AND a.completedAt >= :since")
	long countDistinctActiveUsersSince(@Param("since") LocalDateTime since);
}
