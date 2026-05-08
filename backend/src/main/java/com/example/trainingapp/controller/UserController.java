package com.example.trainingapp.controller;

import com.example.trainingapp.dto.UserRequestDTO;
import com.example.trainingapp.entity.User;
import com.example.trainingapp.service.ActivityLogService;
import com.example.trainingapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Map;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://frontend-training.up.railway.app"
})
public class UserController {

    private final UserService userService;
    private final ActivityLogService activityLogService;

    public UserController(UserService userService, ActivityLogService activityLogService) {
        this.userService = userService;
        this.activityLogService = activityLogService;
    }

    private Jwt requireJwt(JwtAuthenticationToken token) {
        if (token == null || token.getToken() == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Missing Clerk token");
        }

        return token.getToken();
    }

    private User requireCurrentUser(JwtAuthenticationToken token) {
        Jwt jwt = requireJwt(token);
        String clerkId = jwt.getSubject();

        return userService.findByClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "User not found"));
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserRequestDTO userRequest, JwtAuthenticationToken token) {
        Jwt jwt = requireJwt(token);
        User createdUser = userService.createUser(jwt.getSubject(), userRequest.name());
        return ResponseEntity.ok().body(createdUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id, JwtAuthenticationToken token) {
        User currentUser = requireCurrentUser(token);

        if (!currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok().body(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUserPreferences(@PathVariable Long id, @RequestBody UserRequestDTO userRequest, JwtAuthenticationToken token) {
        User currentUser = requireCurrentUser(token);

        if (!currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok().body(userService.updateUserPreferences(id, userRequest));
    }

    @GetMapping("/{userId}/progress")
    public ResponseEntity<Map<String, Object>> getUserProgress(@PathVariable Long userId, JwtAuthenticationToken token) {
        User currentUser = requireCurrentUser(token);

        if (!currentUser.getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok().body(activityLogService.getUserProgress(userId));
    }

    @GetMapping("/me/profile")
    public ResponseEntity<Map<String, Object>> getCurrentUserProfile(JwtAuthenticationToken token) {
        User currentUser = requireCurrentUser(token);

        return ResponseEntity.ok().body(Map.of(
                "id", currentUser.getId(),
                "name", currentUser.getName(),
                "intensityLevel", currentUser.getIntensityLevel(),
                "context", currentUser.getContext(),
                "clerkId", currentUser.getClerkId()
        ));
    }
}
