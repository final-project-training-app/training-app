package com.example.trainingapp.service;

import com.example.trainingapp.entity.User;
import com.example.trainingapp.repository.UserRepository;
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
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User("Jane Doe", 2, "context", "clerk_1");
        user.setId(1L);
        user.setRole("USER");
        user.setTrainerId(2L);
    }

    @Test
    void isAdminReturnsTrueForAdminRole() {
        user.setRole("ADMIN");
        when(userRepository.findByClerkId("clerk_1")).thenReturn(Optional.of(user));

        assertTrue(userService.isAdmin("clerk_1"));
    }

    @Test
    void createUserCreatesNewUserWithProvidedName() {
        when(userRepository.findByClerkId("clerk_2")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User created = userService.createUser("clerk_2", "  New User  ");

        assertEquals("New User", created.getName());
        assertEquals("USER", created.getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUserUsesDefaultNameWhenBlank() {
        when(userRepository.findByClerkId("clerk_3")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User created = userService.createUser("clerk_3", "   ");

        assertEquals("No name entered", created.getName());
    }

    @Test
    void getByClerkIdOrThrowThrowsWhenMissing() {
        when(userRepository.findByClerkId("missing")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> userService.getByClerkIdOrThrow("missing"));
        assertEquals("User not found", ex.getReason());
    }

    @Test
    void updateUserPreferencesByClerkIdUpdatesAndSaves() {
        when(userRepository.findByClerkId("clerk_1")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updated = userService.updateUserPreferencesByClerkId("clerk_1", "  Updated  ", 4, "new", 7L);

        assertEquals("Updated", updated.getName());
        assertEquals(4, updated.getIntensityLevel());
        assertEquals("new", updated.getContext());
        assertEquals(7L, updated.getTrainerId());
    }

    @Test
    void updateUserPreferencesByClerkIdRejectsMissingTrainer() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.updateUserPreferencesByClerkId("clerk_1", "Name", 3, "context", null));

        assertEquals("Trainer is required", ex.getReason());
    }

    @Test
    void getUserByIdThrowsWhenMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> userService.getUserById(99L));
        assertEquals("User not found", ex.getReason());
    }
}
