package com.example.trainingapp.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Trainer Entity Tests")
class TrainerEntityTest {

    @Test
    void settersAndGettersWork() {
        Trainer trainer = new Trainer();
        trainer.setName("Alice");
        trainer.setLanguage("en");

        assertEquals("Alice", trainer.getName());
        assertEquals("en", trainer.getLanguage());
    }
}
