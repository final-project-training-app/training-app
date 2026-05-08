package com.example.trainingapp.controller;

import com.example.trainingapp.dto.UserRequestDTO;
import com.example.trainingapp.entity.User;
import com.example.trainingapp.service.ActivityLogService;
import com.example.trainingapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
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

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserRequestDTO user) {
        if (user.token() == null) {
            return ResponseEntity.status(401).build();
        }
        Jwt jwt = (Jwt) user.token().getPrincipal();

        String clerkId = jwt.getSubject();
        String name = jwt.getClaimAsString("name");

        User createdUser = userService.createUser(clerkId, name);
        return ResponseEntity.ok().body(createdUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok().body(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUserPreferences(@PathVariable Long id, @RequestBody User userRequest) {
        return ResponseEntity.ok().body(userService.updateUserPreferences(id, userRequest));
    }

    @GetMapping("/{userId}/progress")
    public ResponseEntity<Map<String, Object>> getUserProgress(@PathVariable Long userId) {
        return ResponseEntity.ok().body(activityLogService.getUserProgress(userId));
    }

    @GetMapping("/me/profile")
    public ResponseEntity<Map<String, Object>> getCurrentUserProfile(JwtAuthenticationToken token) {
        if (token == null) {
            return ResponseEntity.status(401).build();
        }

        Jwt jwt = (Jwt) token.getPrincipal();
        String userId = jwt.getClaimAsString("sub");
        String email = jwt.getClaimAsString("email");

        return ResponseEntity.ok().body(Map.of(
                "userId", userId,
                "email", email,
                "claims", jwt.getClaims()
        ));
    }
}
