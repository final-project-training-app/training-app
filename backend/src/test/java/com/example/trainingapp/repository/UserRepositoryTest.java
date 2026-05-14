package com.example.trainingapp.repository;

import com.example.trainingapp.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("UserRepository Tests")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void saveAndFindByClerkIdWork() {
        User user = new User("Jane", 2, "context", "clerk_1");
        User saved = userRepository.save(user);

        assertTrue(saved.getId() > 0);
        assertTrue(userRepository.findByClerkId("clerk_1").isPresent());
    }
}
