package com.example.trainingapp.controller;

import com.example.trainingapp.dto.ActivityLogCreateRequestDTO;
import com.example.trainingapp.dto.ActivityLogResponseDTO;
import com.example.trainingapp.entity.ActivityLog;
import com.example.trainingapp.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activity-logs")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://frontend-training.up.railway.app"
})
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    private ActivityLog toEntity(ActivityLogCreateRequestDTO request) {
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUserId(request.userId());
        activityLog.setWorkoutId(request.workoutId());
        activityLog.setCompletedAt(request.completedAt());
        activityLog.setDurationSeconds(request.durationSeconds());
        activityLog.setFeedback(request.feedback());
        activityLog.setStatus(request.status());
        return activityLog;
    }

    private ActivityLogResponseDTO toResponse(ActivityLog activityLog) {
        return new ActivityLogResponseDTO(
                activityLog.getId(),
                activityLog.getUserId(),
                activityLog.getWorkoutId(),
                activityLog.getCompletedAt(),
                activityLog.getDurationSeconds(),
                activityLog.getFeedback(),
                activityLog.getStatus()
        );
    }

    @PostMapping
    public ResponseEntity<ActivityLogResponseDTO> createActivityLog(@RequestBody ActivityLogCreateRequestDTO activityLogRequest) {
        ActivityLog created = activityLogService.createActivityLog(toEntity(activityLogRequest));
        return ResponseEntity.ok().body(toResponse(created));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ActivityLogResponseDTO> completeActivityLog(@PathVariable Long id) {
        ActivityLog completed = activityLogService.completeActivityLog(id);
        return ResponseEntity.ok().body(toResponse(completed));
    }
}
