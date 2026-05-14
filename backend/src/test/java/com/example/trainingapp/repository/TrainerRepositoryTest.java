package com.example.trainingapp.repository;

import com.example.trainingapp.entity.Trainer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("TrainerRepository Tests")
class TrainerRepositoryTest {

    @Autowired
    private TrainerRepository trainerRepository;

    @Test
    void existsByNameAndLanguageIsCaseInsensitive() {
        Trainer trainer = new Trainer();
        trainer.setName("Alice Coach");
        trainer.setPrompt("Prompt");
        trainer.setVoice("Voice");
        trainer.setIntro("Intro");
        trainer.setLanguage("en");
        trainerRepository.save(trainer);

        assertTrue(trainerRepository.existsByNameIgnoreCaseAndLanguageIgnoreCase("alice coach", "EN"));
    }
}
