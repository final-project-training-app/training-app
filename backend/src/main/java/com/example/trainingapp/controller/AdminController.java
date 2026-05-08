package com.example.trainingapp.controller;

import com.example.trainingapp.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://frontend-training.up.railway.app"
})
public class AdminController {
//    @GetMapping("/{userId}/progress")
//    public ResponseEntity<Map<String, Object>> getUserProgress(@PathVariable Long userId) {
//        return ResponseEntity.ok(activityLogService.getUserProgress(userId));
//    }
//    @GetMapping("/{id}")
//    public ResponseEntity<User> getUserById(@PathVariable Long id) {
//        User user = userService.getUserById(id);
//        return ResponseEntity.ok(toResponse(user));
//    }

}
