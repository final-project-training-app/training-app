package com.example.trainingapp.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("User Entity Tests")
class UserEntityTest {

    @Test
    void constructorSetsDefaults() {
        User user = new User("Jane", 2, "context", "clerk_1");

        assertEquals("USER", user.getRole());
        assertEquals(1L, user.getTrainerId());
    }

    @Test
    void gettersAndSettersWork() {
        User user = new User();
        user.setName("Jane");
        user.setIntensityLevel(3);

        assertEquals("Jane", user.getName());
        assertEquals(3, user.getIntensityLevel());
    }
}
