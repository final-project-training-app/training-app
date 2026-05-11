package com.example.trainingapp.controller;

import com.example.trainingapp.service.FeedbackService;
import com.example.trainingapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://frontend-training.up.railway.app"
})
public class AdminController {
    private final UserService service;
    private final FeedbackService feedbackService;


    public AdminController(UserService service, FeedbackService feedbackService) {
        this.service = service;
        this.feedbackService = feedbackService;
    }

    private Jwt getJwtOrThrow(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ResponseStatusException(UNAUTHORIZED, "Missing or invalid authentication token");
        }
        return jwt;
    }

    private String getClerkId(Authentication authentication) {
        return getJwtOrThrow(authentication).getSubject();
    }

    @GetMapping
    public ResponseEntity<String> adminPage(Authentication authentication) {

        String clerkId = getClerkId(authentication);

        if (!service.isAdmin(clerkId)) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        final String name = service.getByClerkIdOrThrow(clerkId).getName();

        return ResponseEntity.ok("Congrats, " + name + " - you're the admin. Try not to break everything. \uD83D\uDE0E");
    }

    @GetMapping("/workouts/feedback-summary")
    public ResponseEntity<List<Map<String, Object>>> getWorkoutFeedbackSummary(Authentication authentication) {
        String clerkId = getClerkId(authentication);

        if (!service.isAdmin(clerkId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(feedbackService.getWorkoutFeedbackSummary());
    }

}
