package com.example.trainingapp.controller;

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

    @PostMapping
    public ResponseEntity<ActivityLog> createActivityLog(@RequestBody ActivityLog activityLog) {
        return ResponseEntity.ok().body(activityLogService.createActivityLog(activityLog));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ActivityLog> completeActivityLog(@PathVariable Long id) {
        return ResponseEntity.ok().body(activityLogService.completeActivityLog(id));
    }
}
