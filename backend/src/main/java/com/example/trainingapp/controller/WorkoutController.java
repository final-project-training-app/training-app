package com.example.trainingapp.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
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

    @PostMapping("/recommendation")
    public ResponseEntity<Map<String, Object>> recommendWorkout(@RequestBody Map<String, Object> filters) {
        Long recommendedWorkoutId = workoutService.recommendWorkout(filters);

        return ResponseEntity.ok(Map.of(
                "recommendedWorkoutId", recommendedWorkoutId
        ));
    }
}
