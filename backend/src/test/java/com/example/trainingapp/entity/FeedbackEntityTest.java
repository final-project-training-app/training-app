package com.example.trainingapp.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Feedback Entity Tests")
class FeedbackEntityTest {

    @Test
    void settersAndGettersWork() {
        Feedback feedback = new Feedback();
        feedback.setUserId(1L);
        feedback.setWorkoutId(2L);
        feedback.setRating(5);
        feedback.setLiked(true);

        assertEquals(1L, feedback.getUserId());
        assertEquals(2L, feedback.getWorkoutId());
        assertEquals(5, feedback.getRating());
        assertTrue(feedback.getLiked());
    }
}
