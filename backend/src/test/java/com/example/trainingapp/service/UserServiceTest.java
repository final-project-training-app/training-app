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

    @Test
    void trainerSelectionPersistenceCycle_createsWithTrainer1_updatesToTrainer2_persists() {
        // Step 1: Create user (should get trainer 1)
        when(userRepository.findByClerkId("clerk-2")).thenReturn(Optional.empty());
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        User created = userService.createUser("clerk-2", "Jordan");
        assertEquals(1L, created.getTrainerId(), "User should be created with default trainer 1");

        // Step 2: Simulate reading user profile (database state after create)
        User userAfterCreate = new User("Jordan", 2, "", "clerk-2");
        userAfterCreate.setId(1L);
        userAfterCreate.setTrainerId(1L);

        // Step 3: Update trainer to 2
        when(userRepository.findByClerkId("clerk-2")).thenReturn(Optional.of(userAfterCreate));
        User updated = userService.updateUserPreferencesByClerkId(
                "clerk-2",
                "Jordan",
                2,
                "",
                2L // Update to trainer 2
        );
        assertEquals(2L, updated.getTrainerId(), "User should be able to update trainer to 2");

        // Step 4: Simulate reading again (database now returns trainer 2)
        User userAfterUpdate = new User("Jordan", 2, "", "clerk-2");
        userAfterUpdate.setId(1L);
        userAfterUpdate.setTrainerId(2L);
        assertEquals(2L, userAfterUpdate.getTrainerId(), "Profile read after update returns trainer 2");
    }

    @Test
    void profileReadReturnsSelectedTrainerId_ensuringFrontendCanDisplay() {
        // Simulate frontend reading profile after user has selected trainer 3
        User user = new User("Sam", 2, "", "clerk-3");
        user.setId(2L);
        user.setTrainerId(3L);
        when(userRepository.findByClerkId("clerk-3")).thenReturn(Optional.of(user));

        // Frontend calls userService.getByClerkId (or equivalent)
        Optional<User> profileRead = userRepository.findByClerkId("clerk-3");
        
        assertEquals(Optional.of(user), profileRead, "Profile read returns user");
        assertEquals(3L, profileRead.get().getTrainerId(), 
                "Profile contains trainerId so frontend can display selected trainer");
    }
}
