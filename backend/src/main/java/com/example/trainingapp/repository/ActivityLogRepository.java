package com.example.trainingapp.repository;

import com.example.trainingapp.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
	List<ActivityLog> findByUserIdAndStatusOrderByCompletedAtDesc(Long userId, String status);
}
