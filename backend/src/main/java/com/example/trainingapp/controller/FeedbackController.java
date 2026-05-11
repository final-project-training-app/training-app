package com.example.trainingapp.controller;

import com.example.trainingapp.entity.Feedback;
import com.example.trainingapp.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://frontend-training.up.railway.app"
})
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<Feedback> createFeedback(@RequestBody Feedback feedback) {
        Feedback saved = feedbackService.saveFeedback(feedback);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getFeedback(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long workoutId
    ) {
        List<Feedback> feedbacks;

        if (userId != null && workoutId != null) {
            feedbacks = feedbackService.getFeedbackByUserAndWorkout(userId, workoutId);
        } else if (userId != null) {
            feedbacks = feedbackService.getFeedbackByUserId(userId);
        } else if (workoutId != null) {
            feedbacks = feedbackService.getFeedbackByWorkoutId(workoutId);
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(feedbacks);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        if (feedbackService.getFeedbackById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}

