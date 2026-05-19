package com.example.trainingapp.service;

import com.example.trainingapp.dto.TrainerRequestDto;
import com.example.trainingapp.entity.Trainer;
import com.example.trainingapp.repository.TrainerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TrainerService Tests")
class TrainerServiceTest {

    @Mock
    private TrainerRepository trainerRepository;

    @InjectMocks
    private TrainerService trainerService;

    private Trainer trainer;
    private TrainerRequestDto trainerRequest;

    @BeforeEach
    void setUp() {
        trainer = new Trainer();
        trainer.setId(1L);
        trainer.setName("Alice Coach");
        trainer.setPrompt("Prompt");
        trainer.setVoice("Voice");
        trainer.setIntro("Intro");
        trainer.setLanguage("en");

        trainerRequest = new TrainerRequestDto("Alice Coach", "Prompt", "Voice", "Intro", "en", null, null, null, null);
    }

    @Test
    void createTrainerSavesValidRequest() {
        when(trainerRepository.existsByNameIgnoreCaseAndLanguageIgnoreCase("Alice Coach", "en")).thenReturn(false);
        when(trainerRepository.save(any(Trainer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Trainer created = trainerService.createTrainer(trainerRequest);

        assertEquals("Alice Coach", created.getName());
    }

    @Test
    void createTrainerRejectsNullBody() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> trainerService.createTrainer(null));
        assertEquals("Request body is required", ex.getReason());
    }

    @Test
    void createTrainerRejectsDuplicateNameAndLanguage() {
        when(trainerRepository.existsByNameIgnoreCaseAndLanguageIgnoreCase("Alice Coach", "en")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> trainerService.createTrainer(trainerRequest));
        assertEquals("Trainer already exists for this language", ex.getReason());
    }

    @Test
    void getTrainerByIdThrowsWhenMissing() {
        when(trainerRepository.findById(9L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> trainerService.getTrainerById(9L));
        assertEquals("Trainer not found", ex.getReason());
    }

    @Test
    void deleteTrainerDeletesExistingTrainer() {
        when(trainerRepository.existsById(1L)).thenReturn(true);

        trainerService.deleteTrainer(1L);

        verify(trainerRepository).deleteById(1L);
    }
}
