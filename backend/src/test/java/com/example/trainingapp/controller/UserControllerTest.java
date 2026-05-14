package com.example.trainingapp.controller;

import com.example.trainingapp.dto.UserRequestDTO;
import com.example.trainingapp.entity.User;
import com.example.trainingapp.service.ActivityLogService;
import com.example.trainingapp.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private UserController userController;

    @Test
    void getCurrentUserProfile_includesTrainerIdInResponse() {
        User user = new User("Alex", 3, "focus", "clerk-1");
        user.setId(42L);
        user.setTrainerId(7L);

        when(userService.getByClerkIdOrThrow("clerk-1")).thenReturn(user);
        when(userService.isAdmin("clerk-1")).thenReturn(true);

        ResponseEntity<?> response = userController.getCurrentUserProfile(authentication("clerk-1"));

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        String body = response.getBody().toString();
        assertTrue(body.contains("trainerId=7"), "Expected trainerId=7 in response body but was: " + body);
    }

    @Test
    void updateCurrentUserProfile_includesTrainerIdInResponse() {
        User updated = new User("Alex", 3, "focus", "clerk-1");
        updated.setId(42L);
        updated.setTrainerId(9L);

        when(userService.updateUserPreferencesByClerkId("clerk-1", "Alex", 3, "focus", 9L))
                .thenReturn(updated);
        when(userService.isAdmin("clerk-1")).thenReturn(false);

        ResponseEntity<?> response = userController.updateCurrentUserProfile(
                new UserRequestDTO("Alex", 3, "focus", 9L),
                authentication("clerk-1")
        );

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        String body = response.getBody().toString();
        assertTrue(body.contains("trainerId=9"), "Expected trainerId=9 in response body but was: " + body);
    }

    private Authentication authentication(String clerkId) {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", clerkId)
                .build();
        return new JwtAuthenticationToken(jwt);
    }
}
