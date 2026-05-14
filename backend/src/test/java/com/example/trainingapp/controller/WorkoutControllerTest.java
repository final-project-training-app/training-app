package com.example.trainingapp.controller;

import com.example.trainingapp.dto.WorkoutResponseDTO;
import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.service.UserService;
import com.example.trainingapp.service.WorkoutService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WorkoutController Tests")
class WorkoutControllerTest {

    @Mock
    private WorkoutService workoutService;

    @Mock
    private UserService userService;

    @Test
    void getAllWorkoutsReturnsData() {
        WorkoutController controller = new WorkoutController(workoutService, userService);

        WorkoutResponseDTO workoutDTO = new WorkoutResponseDTO(
                1L, "Push Ups", null, null, null, null, null, null, null, null,
                null, null, null, null, null
        );

        when(workoutService.getAllWorkouts()).thenReturn(List.of(workoutDTO));

        ResponseEntity<List<WorkoutResponseDTO>> response = controller.getAllWorkouts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Push Ups", response.getBody().get(0).name());
    }

    @Test
    void createWorkoutReturnsForbiddenForNonAdmin() {
        WorkoutController controller = new WorkoutController(workoutService, userService);

        when(userService.isAdmin("user_1")).thenReturn(false);

        ResponseEntity<WorkoutResponseDTO> response =
                controller.createWorkout(new Workout(), auth("user_1"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(workoutService, never()).createWorkout(any());
    }

    @Test
    void createWorkoutReturnsOkForAdmin() {
        WorkoutController controller = new WorkoutController(workoutService, userService);

        when(userService.isAdmin("admin_1")).thenReturn(true);

        Workout workout = new Workout();
        workout.setName("Test Workout");

        WorkoutResponseDTO responseDTO = new WorkoutResponseDTO(
                null, "Test Workout", null, null, null, null, null, null, null, null,
                null, null, null, null, null
        );

        when(workoutService.createWorkout(any())).thenReturn(responseDTO);

        ResponseEntity<WorkoutResponseDTO> response =
                controller.createWorkout(workout, auth("admin_1"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Test Workout", response.getBody().name());
    }

    @Test
    void deleteWorkoutReturnsNoContentForAdmin() {
        WorkoutController controller = new WorkoutController(workoutService, userService);

        when(userService.isAdmin("admin_1")).thenReturn(true);

        ResponseEntity<Void> response =
                controller.deleteWorkout(1L, auth("admin_1"));

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(workoutService).deleteWorkout(1L);
    }

    private Authentication auth(String subject) {
        Authentication auth = mock(Authentication.class);
        Jwt jwt = mock(Jwt.class);

        when(auth.getPrincipal()).thenReturn(jwt);
        when(jwt.getSubject()).thenReturn(subject);

        return auth;
    }
}