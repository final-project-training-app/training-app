package com.example.trainingapp.controller;

import com.example.trainingapp.entity.User;
import com.example.trainingapp.entity.UserWorkoutPreferenceType;
import com.example.trainingapp.service.UserService;
import com.example.trainingapp.service.UserWorkoutPreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/users/me/preferences")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://frontend-training.up.railway.app"
})
public class UserPreferenceController {

    private final UserService userService;
    private final UserWorkoutPreferenceService preferenceService;

    public UserPreferenceController(UserService userService, UserWorkoutPreferenceService preferenceService) {
        this.userService = userService;
        this.preferenceService = preferenceService;
    }

    private Jwt getJwtOrThrow(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ResponseStatusException(UNAUTHORIZED, "Missing or invalid authentication token");
        }
        return jwt;
    }

    private Long getCurrentUserId(Authentication authentication) {
        Jwt jwt = getJwtOrThrow(authentication);
        User user = userService.getByClerkIdOrThrow(jwt.getSubject());
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<Map<String, List<Long>>> getMyPreferences(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(preferenceService.getPreferences(userId));
    }

    @PostMapping("/favorites/{workoutId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long workoutId, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        preferenceService.addPreference(userId, workoutId, UserWorkoutPreferenceType.FAVORITE);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/favorites/{workoutId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long workoutId, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        preferenceService.removePreference(userId, workoutId, UserWorkoutPreferenceType.FAVORITE);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/disliked/{workoutId}")
    public ResponseEntity<Void> addDisliked(@PathVariable Long workoutId, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        preferenceService.addPreference(userId, workoutId, UserWorkoutPreferenceType.DISLIKED);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/disliked/{workoutId}")
    public ResponseEntity<Void> removeDisliked(@PathVariable Long workoutId, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        preferenceService.removePreference(userId, workoutId, UserWorkoutPreferenceType.DISLIKED);
        return ResponseEntity.noContent().build();
    }
}

