package com.example.trainingapp.service;

import com.example.trainingapp.entity.Feedback;
import com.example.trainingapp.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public Feedback saveFeedback(Feedback feedback) {
        feedback.setCreatedAt(LocalDateTime.now());
        return feedbackRepository.save(feedback);
    }

    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    public List<Feedback> getFeedbackByUserId(Long userId) {
        return feedbackRepository.findByUserId(userId);
    }

    public List<Feedback> getFeedbackByWorkoutId(Long workoutId) {
        return feedbackRepository.findByWorkoutId(workoutId);
    }

    public List<Feedback> getFeedbackByUserAndWorkout(Long userId, Long workoutId) {
        return feedbackRepository.findByUserIdAndWorkoutId(userId, workoutId);
    }

    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }
}

