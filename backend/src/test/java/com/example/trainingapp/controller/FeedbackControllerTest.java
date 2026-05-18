package com.example.trainingapp.controller;

import com.example.trainingapp.dto.FeedbackRequestDTO;
import com.example.trainingapp.dto.FeedbackResponseDTO;
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
        FeedbackRequestDTO request = new FeedbackRequestDTO(
                1L,
                2L,
                null,
                FeedbackDifficulty.JUST_RIGHT,
                true,
                4,
                "Great"
        );
        Feedback feedback = new Feedback();
        feedback.setId(9L);
        feedback.setUserId(1L);
        feedback.setWorkoutId(2L);
        feedback.setDifficulty(FeedbackDifficulty.JUST_RIGHT);
        when(feedbackService.saveFeedback(any(Feedback.class))).thenReturn(feedback);

        ResponseEntity<FeedbackResponseDTO> response = controller.createFeedback(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(9L, response.getBody().id());
    }

    @Test
    void getFeedbackByIdReturnsNotFoundWhenMissing() {
        FeedbackController controller = new FeedbackController(feedbackService);
        when(feedbackService.getFeedbackById(1L)).thenReturn(Optional.empty());

        ResponseEntity<FeedbackResponseDTO> response = controller.getFeedbackById(1L);

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

        ResponseEntity<List<FeedbackResponseDTO>> response = controller.getFeedback(null, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
