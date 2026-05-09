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

import java.util.Map;

record CreateUserRequest(String displayName) {
}

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://frontend-training.up.railway.app"
})
public class UserController {

    private static final String DEFAULT_DISPLAY_NAME = "No name entered";

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
        // Try common claim keys that Clerk/OpenID might provide for a user's name.
        String[] claimKeys = new String[]{"name", "full_name", "preferred_username"};
        for (String key : claimKeys) {
            Object claimVal = jwt.getClaims().get(key);
            if (claimVal instanceof String) {
                String s = ((String) claimVal).trim();
                if (!s.isEmpty()) return s;
            }
        }

        String givenName = jwt.getClaimAsString("given_name");
        String familyName = jwt.getClaimAsString("family_name");
        String fullName = String.join(" ",
                java.util.Arrays.asList(givenName, familyName).stream()
                        .filter(part -> part != null && !part.isBlank())
                        .toList()
        ).trim();

        if (!fullName.isEmpty()) {
            return fullName;
        }

        String email = jwt.getClaimAsString("email");
        if (email != null && !email.isBlank()) {
            return email.trim();
        }

        // If Clerk does not provide a name claim, store a readable placeholder.
        return DEFAULT_DISPLAY_NAME;
    }

    private UserResponseDTO toResponse(User user) {
        return new UserResponseDTO(
                user.getName(),
                user.getIntensityLevel(),
                user.getContext()
        );
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(
            @RequestBody(required = false) CreateUserRequest request,
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String requestedName = request != null ? request.displayName() : null;

        User created = userService.createUser(
                jwt.getSubject(),
                requestedName != null && !requestedName.isBlank()
                        ? requestedName
                        : resolveDisplayName(jwt)
        );

        return ResponseEntity.ok(toResponse(created));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<UserResponseDTO> updateCurrentUserProfile(
            @RequestBody UserRequestDTO userRequest,
            Authentication authentication
    ) {
        User updated = userService.updateUserPreferencesByClerkId(
                getClerkId(authentication),
                userRequest.name(),
                userRequest.intensityLevel(),
                userRequest.context()
        );

        return ResponseEntity.ok(toResponse(updated));
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

        User currentUser = userService.getByClerkIdOrThrow(getClerkId(authentication));

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