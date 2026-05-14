package com.example.trainingapp.service;

import com.example.trainingapp.entity.User;
import com.example.trainingapp.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_assignsDefaultTrainerOnNewUser() {
        when(userRepository.findByClerkId("clerk-1")).thenReturn(Optional.empty());
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        User created = userService.createUser("clerk-1", "Alex");

        assertEquals(1L, created.getTrainerId());
    }

    @Test
    void updateUserPreferencesByClerkId_savesSelectedTrainerId() {
        User existing = new User("Alex", 2, "", "clerk-1");
        existing.setTrainerId(1L);
        when(userRepository.findByClerkId("clerk-1")).thenReturn(Optional.of(existing));
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        User updated = userService.updateUserPreferencesByClerkId(
                "clerk-1",
                "Alex",
                3,
                "focus",
                7L
        );

        assertEquals(7L, updated.getTrainerId());
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals(7L, captor.getValue().getTrainerId());
    }

    @Test
    void updateUserPreferencesByClerkId_rejectsMissingTrainerId() {
        assertThrows(ResponseStatusException.class, () ->
                userService.updateUserPreferencesByClerkId(
                        "clerk-1",
                        "Alex",
                        3,
                        "focus",
                        null
                )
        );
    }
}
