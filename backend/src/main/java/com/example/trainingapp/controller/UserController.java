package com.example.trainingapp.controller;

import com.example.trainingapp.dto.UserRequestDTO;
import com.example.trainingapp.dto.UserResponseDTO;
import com.example.trainingapp.entity.User;
import com.example.trainingapp.service.ActivityLogService;
import com.example.trainingapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

    private String getClerkId(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getSubject();
    }

    private String resolveDisplayName(Jwt jwt) {
        String name = jwt.getClaimAsString("name");
        if (name != null && !name.isBlank()) return name;

        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");

        if ((firstName != null && !firstName.isBlank()) ||
                (lastName != null && !lastName.isBlank())) {
            return ((firstName != null ? firstName : "") + " " +
                    (lastName != null ? lastName : "")).trim();
        }

        String email = jwt.getClaimAsString("email");
        if (email != null && !email.isBlank()) {
            int atIndex = email.indexOf("@");
            return atIndex > 0 ? email.substring(0, atIndex) : email;
        }

        return "User";
    }

    private UserResponseDTO toResponse(User user) {
        return new UserResponseDTO(
                user.getName(),
                user.getIntensityLevel(),
                user.getContext()
        );
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        User created = userService.createUser(
                jwt.getSubject(),
                resolveDisplayName(jwt)
        );

        return ResponseEntity.ok(toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUserPreferences(
            @PathVariable Long id,
            @RequestBody UserRequestDTO userRequest,
            Authentication authentication
    ) {
        User currentUser = userService.findByClerkId(
                ((Jwt) authentication.getPrincipal()).getSubject()
        ).orElseThrow();

        if (!currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }

        User updated = userService.updateUserPreferencesByClerkId(
                getClerkId(authentication),
                userRequest.name(),
                userRequest.intensityLevel(),
                userRequest.context()
        );

        return ResponseEntity.ok(toResponse(updated));
    }

    @GetMapping("/me/progress")
    public ResponseEntity<Map<String, Object>> getMyProgress(Authentication authentication) {
        User currentUser = userService.findByClerkId(getClerkId(authentication))
                .orElseThrow();

        return ResponseEntity.ok(activityLogService.getUserProgress(currentUser.getId()));
    }

    @GetMapping("/me/profile")
    public ResponseEntity<UserResponseDTO> getCurrentUserProfile(Authentication authentication) {

        User currentUser = userService.findByClerkId(
                ((Jwt) authentication.getPrincipal()).getSubject()
        ).orElseThrow();

        return ResponseEntity.ok(toResponse(currentUser));
    }

    @GetMapping("/{userId}/progress")
    public ResponseEntity<Map<String, Object>> getUserProgress(@PathVariable Long userId) {
        return ResponseEntity.ok(activityLogService.getUserProgress(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(toResponse(user));
    }
}