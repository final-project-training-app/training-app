package com.example.trainingapp.service;

import com.example.trainingapp.entity.Feedback;
import com.example.trainingapp.entity.FeedbackDifficulty;
import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.entity.UserWorkoutPreferenceType;
import com.example.trainingapp.repository.FeedbackRepository;
import com.example.trainingapp.repository.WorkoutRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FeedbackService Tests")
class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private WorkoutRepository workoutRepository;

    @Mock
    private UserWorkoutPreferenceService preferenceService;

    @InjectMocks
    private FeedbackService feedbackService;

    private Feedback feedback;
    private Workout workout;

    @BeforeEach
    void setUp() {
        feedback = new Feedback();
        feedback.setId(1L);
        feedback.setUserId(2L);
        feedback.setWorkoutId(3L);
        feedback.setRating(4);
        feedback.setLiked(true);
        feedback.setDifficulty(FeedbackDifficulty.JUST_RIGHT);

        workout = new Workout();
        workout.setId(3L);
        workout.setName("Push Ups");
    }

    @Test
    void saveFeedbackStoresTimestampAndSaves() {
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Feedback saved = feedbackService.saveFeedback(feedback);

        assertNotNull(saved.getCreatedAt());
        verify(feedbackRepository).save(feedback);
    }

    @Test
    void saveFeedbackAddsDislikedPreferenceWhenLikedIsFalse() {
        feedback.setLiked(false);
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(invocation -> invocation.getArgument(0));

        feedbackService.saveFeedback(feedback);

        verify(preferenceService).addPreference(2L, 3L, UserWorkoutPreferenceType.DISLIKED);
    }

    @Test
    void saveFeedbackRejectsMissingUserOrWorkoutId() {
        feedback.setUserId(null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> feedbackService.saveFeedback(feedback));
        assertEquals("userId and workoutId are required", ex.getReason());
    }

    @Test
    void saveFeedbackRejectsRatingOutsideRange() {
        feedback.setRating(6);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> feedbackService.saveFeedback(feedback));
        assertEquals("rating must be between 1 and 5", ex.getReason());
    }

    @Test
    void getWorkoutFeedbackSummaryReturnsDataForWorkout() {
        Feedback other = new Feedback();
        other.setWorkoutId(3L);
        other.setRating(5);
        other.setLiked(true);
        other.setDifficulty(FeedbackDifficulty.JUST_RIGHT);

        when(workoutRepository.findAll()).thenReturn(List.of(workout));
        when(feedbackRepository.findAll()).thenReturn(List.of(feedback, other));

        List<Map<String, Object>> summary = feedbackService.getWorkoutFeedbackSummary();

        assertEquals(1, summary.size());
        assertEquals(2, summary.get(0).get("feedbackCount"));
    }
}
