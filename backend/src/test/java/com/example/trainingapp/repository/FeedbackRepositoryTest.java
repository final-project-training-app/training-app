package com.example.trainingapp.repository;

import com.example.trainingapp.entity.Feedback;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("FeedbackRepository Tests")
class FeedbackRepositoryTest {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Test
    void saveAndQueryByUserAndWorkoutWork() {
        Feedback feedback = new Feedback();
        feedback.setUserId(1L);
        feedback.setWorkoutId(2L);
        feedback.setRating(5);

        feedbackRepository.save(feedback);

        assertEquals(1, feedbackRepository.findByUserId(1L).size());
        assertEquals(1, feedbackRepository.findByWorkoutId(2L).size());
        assertEquals(1, feedbackRepository.findByUserIdAndWorkoutId(1L, 2L).size());
    }
}
