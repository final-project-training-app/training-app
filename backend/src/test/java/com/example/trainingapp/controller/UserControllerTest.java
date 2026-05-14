package com.example.trainingapp.controller;

import com.example.trainingapp.dto.UserRequestDTO;
import com.example.trainingapp.entity.User;
import com.example.trainingapp.service.ActivityLogService;
import com.example.trainingapp.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserController Tests")
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private ActivityLogService activityLogService;

    @Test
    void createUserReturnsResponseBody() {
        UserController controller = new UserController(userService, activityLogService);
        User user = new User("Jane", 2, "context", "clerk_1");
        user.setTrainerId(1L);
        when(userService.createUser(eq("clerk_1"), any())).thenReturn(user);
        when(userService.isAdmin("clerk_1")).thenReturn(false);

        ResponseEntity<?> response = controller.createUser(Map.of("displayName", "Jane"), auth("clerk_1", "Jane"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userService).createUser(eq("clerk_1"), any());
    }

    @Test
    void updateCurrentUserProfileReturnsOk() {
        UserController controller = new UserController(userService, activityLogService);
        User user = new User("Jane", 3, "context", "clerk_1");
        user.setTrainerId(4L);
        when(userService.updateUserPreferencesByClerkId("clerk_1", "Jane", 3, "context", 4L)).thenReturn(user);
        when(userService.isAdmin("clerk_1")).thenReturn(false);

        ResponseEntity<?> response = controller.updateCurrentUserProfile(new UserRequestDTO("Jane", 3, "context", 4L), auth("clerk_1", "Jane"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void updateUserPreferencesReturnsForbiddenWhenNotOwner() {
        UserController controller = new UserController(userService, activityLogService);
        User currentUser = new User("Jane", 2, "context", "clerk_1");
        currentUser.setId(1L);
        when(userService.findByClerkId("clerk_1")).thenReturn(Optional.of(currentUser));

        ResponseEntity<?> response = controller.updateUserPreferences(9L, new UserRequestDTO("Other", 2, "x", 1L), auth("clerk_1", "Jane"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void getUserByIdReturnsMappedResponse() {
        UserController controller = new UserController(userService, activityLogService);
        User user = new User("Jane", 2, "context", "clerk_1");
        user.setTrainerId(9L);
        when(userService.getUserById(1L)).thenReturn(user);

        ResponseEntity<?> response = controller.getUserById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    private Authentication auth(String subject, String name) {
        Authentication auth = mock(Authentication.class);
        Jwt jwt = mock(Jwt.class);
        when(auth.getPrincipal()).thenReturn(jwt);
        when(jwt.getSubject()).thenReturn(subject);
        return auth;
    }
}
