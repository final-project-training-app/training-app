package com.example.trainingapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.trainingapp.entity.Workout;
import com.example.trainingapp.service.WorkoutService;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://frontend-training.up.railway.app"
})
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @GetMapping("/{id}/audio")
    public ResponseEntity<String> getWorkoutAudio(@PathVariable Long id) {
        return ResponseEntity.ok().body(workoutService.getWorkoutAudioUrl(id));
    }

    @GetMapping
    public ResponseEntity<List<Workout>> getAllWorkouts() {
        return ResponseEntity.ok().body(workoutService.getAllWorkouts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workout> getWorkoutById(@PathVariable Long id) {
        return ResponseEntity.ok().body(workoutService.getWorkoutById(id));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Workout> startWorkout(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok().body(workoutService.startWorkout(id, userId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Workout> createWorkout(@RequestBody Workout workout) {
        return ResponseEntity.ok(workoutService.createWorkout(workout));
    }
}
