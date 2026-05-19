package com.example.trainingapp.controller;

import com.example.trainingapp.dto.AdminUserCountDTO;
import com.example.trainingapp.service.ActivityLogService;
import com.example.trainingapp.service.FeedbackService;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminController Tests")
class AdminControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private FeedbackService feedbackService;

    @Mock
    private ActivityLogService activityLogService;

    @Test
    @DisplayName("getUserCount returns count DTO for admin")
    void getUserCountReturnsCountForAdmin() {
        AdminController controller = new AdminController(userService, feedbackService, activityLogService);
        when(userService.isAdmin("clerk_admin")).thenReturn(true);
        when(userService.getUserCount()).thenReturn(42L);
        when(activityLogService.getActiveUserCount()).thenReturn(7L);

        ResponseEntity<AdminUserCountDTO> response = controller.getUserCount(auth("clerk_admin"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(42L, response.getBody().count());
        assertEquals(7L, response.getBody().activeCount());
    }

    @Test
    @DisplayName("getUserCount returns 403 for non-admin")
    void getUserCountReturnsForbiddenForNonAdmin() {
        AdminController controller = new AdminController(userService, feedbackService, activityLogService);
        when(userService.isAdmin("clerk_user")).thenReturn(false);

        ResponseEntity<AdminUserCountDTO> response = controller.getUserCount(auth("clerk_user"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(userService, never()).getUserCount();
        verify(activityLogService, never()).getActiveUserCount();
    }

    private Authentication auth(String subject) {
        Authentication auth = mock(Authentication.class);
        Jwt jwt = mock(Jwt.class);
        when(auth.getPrincipal()).thenReturn(jwt);
        when(jwt.getSubject()).thenReturn(subject);
        return auth;
    }
}
