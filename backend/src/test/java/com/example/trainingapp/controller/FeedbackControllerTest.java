package com.example.trainingapp.controller;

import com.example.trainingapp.entity.Feedback;
import com.example.trainingapp.entity.FeedbackDifficulty;
import com.example.trainingapp.service.FeedbackService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FeedbackController Tests")
class FeedbackControllerTest {

    @Mock
    private FeedbackService feedbackService;

    @Test
    void createFeedbackReturnsSavedEntity() {
        FeedbackController controller = new FeedbackController(feedbackService);
        Feedback feedback = new Feedback();
        feedback.setUserId(1L);
        feedback.setWorkoutId(2L);
        feedback.setDifficulty(FeedbackDifficulty.JUST_RIGHT);
        when(feedbackService.saveFeedback(any(Feedback.class))).thenReturn(feedback);

        ResponseEntity<Feedback> response = controller.createFeedback(feedback);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getFeedbackByIdReturnsNotFoundWhenMissing() {
        FeedbackController controller = new FeedbackController(feedbackService);
        when(feedbackService.getFeedbackById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Feedback> response = controller.getFeedbackById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deleteFeedbackReturnsNoContentWhenPresent() {
        FeedbackController controller = new FeedbackController(feedbackService);
        when(feedbackService.getFeedbackById(1L)).thenReturn(Optional.of(new Feedback()));

        ResponseEntity<Void> response = controller.deleteFeedback(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(feedbackService).deleteFeedback(1L);
    }

    @Test
    void getFeedbackReturnsBadRequestWithoutFilters() {
        FeedbackController controller = new FeedbackController(feedbackService);

        ResponseEntity<List<Feedback>> response = controller.getFeedback(null, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
