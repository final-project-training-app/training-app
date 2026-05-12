package com.example.trainingapp.controller;

import com.example.trainingapp.entity.Trainer;
import com.example.trainingapp.service.TrainerService;
import com.example.trainingapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/trainers")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://frontend-training.up.railway.app"
})
public class TrainerController {

    private final TrainerService trainerService;
    private final UserService userService;

    public TrainerController(TrainerService trainerService, UserService userService) {
        this.trainerService = trainerService;
        this.userService = userService;
    }

    private Jwt getJwtOrThrow(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ResponseStatusException(UNAUTHORIZED, "Missing or invalid authentication token");
        }
        return jwt;
    }

    private void assertAdmin(Authentication authentication) {
        boolean isAdmin = userService.isAdmin(getJwtOrThrow(authentication).getSubject());
        if (!isAdmin) {
            throw new ResponseStatusException(FORBIDDEN, "Admin access required");
        }
    }

    @GetMapping
    public ResponseEntity<List<Trainer>> getAllTrainers() {
        return ResponseEntity.ok().body(trainerService.getAllTrainers());
    }

    @PostMapping
    public ResponseEntity<Trainer> createTrainer(@RequestBody Trainer trainer, Authentication authentication) {
        assertAdmin(authentication);
        return ResponseEntity.ok(trainerService.createTrainer(trainer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trainer> updateTrainer(@PathVariable Long id, @RequestBody Trainer trainer, Authentication authentication) {
        assertAdmin(authentication);
        return ResponseEntity.ok(trainerService.updateTrainer(id, trainer));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trainer> getTrainerById(@PathVariable Long id) {
        return ResponseEntity.ok().body(trainerService.getTrainerById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrainer(@PathVariable Long id, Authentication authentication) {
        assertAdmin(authentication);
        trainerService.deleteTrainer(id);
        return ResponseEntity.noContent().build();
    }
}

