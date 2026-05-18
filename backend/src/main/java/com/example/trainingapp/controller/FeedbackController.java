package com.example.trainingapp.controller;

import com.example.trainingapp.dto.FeedbackRequestDTO;
import com.example.trainingapp.dto.FeedbackResponseDTO;
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

    private Feedback toEntity(FeedbackRequestDTO request) {
        Feedback feedback = new Feedback();
        feedback.setUserId(request.userId());
        feedback.setWorkoutId(request.workoutId());
        feedback.setActivityLogId(request.activityLogId());
        feedback.setDifficulty(request.difficulty());
        feedback.setLiked(request.liked());
        feedback.setRating(request.rating());
        feedback.setComment(request.comment());
        return feedback;
    }

    private FeedbackResponseDTO toResponse(Feedback feedback) {
        return new FeedbackResponseDTO(
                feedback.getId(),
                feedback.getUserId(),
                feedback.getWorkoutId(),
                feedback.getActivityLogId(),
                feedback.getDifficulty(),
                feedback.getLiked(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getCreatedAt()
        );
    }

    @PostMapping
    public ResponseEntity<FeedbackResponseDTO> createFeedback(@RequestBody FeedbackRequestDTO feedbackRequest) {
        Feedback saved = feedbackService.saveFeedback(toEntity(feedbackRequest));
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackResponseDTO> getFeedbackById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedback(
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

        return ResponseEntity.ok(feedbacks.stream().map(this::toResponse).toList());
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

