package com.example.trainingapp.integration;

import com.example.trainingapp.entity.User;
import com.example.trainingapp.repository.UserRepository;
import com.example.trainingapp.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Import(UserService.class)
@DisplayName("UserService Integration Tests")
class UserServiceIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void createUserPersistsAndCanBeLoaded() {
        User created = userService.createUser("clerk_int_1", "Integration User");

        assertNotNull(created.getId());
        assertTrue(userRepository.findByClerkId("clerk_int_1").isPresent());
    }

    @Test
    void updateUserPreferencesPersistsChanges() {
        userService.createUser("clerk_int_2", "Original");

        User updated = userService.updateUserPreferencesByClerkId("clerk_int_2", "Updated", 5, "context", 7L);

        assertEquals("Updated", updated.getName());
        assertEquals(5, updated.getIntensityLevel());
        assertEquals(7L, updated.getTrainerId());
        assertEquals("Updated", userRepository.findByClerkId("clerk_int_2").orElseThrow().getName());
    }
}
