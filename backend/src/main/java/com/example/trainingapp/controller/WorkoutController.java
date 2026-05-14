package com.example.trainingapp.controller;

import java.util.List;

import com.example.trainingapp.dto.WorkoutResponseDTO;
import com.example.trainingapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.service.WorkoutService;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://frontend-training.up.railway.app"
})
public class WorkoutController {

    private final WorkoutService workoutService;
    private final UserService userService;

    public WorkoutController(WorkoutService workoutService, UserService userService) {
        this.workoutService = workoutService;
        this.userService = userService;
    }

    private Jwt getJwtOrThrow(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ResponseStatusException(UNAUTHORIZED, "Missing or invalid authentication token");
        }
        return jwt;
    }

    private boolean isAdmin(Authentication authentication) {
        return userService.isAdmin(getJwtOrThrow(authentication).getSubject());
    }

    @GetMapping("/{id}/audio")
    public ResponseEntity<String> getWorkoutAudio(@PathVariable Long id) {
        return ResponseEntity.ok().body(workoutService.getWorkoutAudioUrl(id));
    }

    @GetMapping
    public ResponseEntity<List<WorkoutResponseDTO>> getAllWorkouts() {

        return ResponseEntity.ok().body(workoutService.getAllWorkouts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutResponseDTO> getWorkoutById(@PathVariable Long id) {
        return ResponseEntity.ok().body(workoutService.getWorkoutById(id));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<WorkoutResponseDTO> startWorkout(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok().body(workoutService.startWorkout(id, userId));
    }

    @PostMapping
    public ResponseEntity<WorkoutResponseDTO> createWorkout(@RequestBody Workout workout, Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(workoutService.createWorkout(workout));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutResponseDTO> updateWorkout(
            @PathVariable Long id,
            @RequestBody Workout workout,
            Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(workoutService.updateWorkout(id, workout));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        workoutService.deleteWorkout(id);
        return ResponseEntity.noContent().build();
    }
}
