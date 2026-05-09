package com.example.trainingapp.controller;

import com.example.trainingapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://frontend-training.up.railway.app"
})
public class AdminController {
    private UserService service;


    public AdminController(UserService service) {
        this.service = service;
    }
    private String getClerkId(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getSubject();
    }

    @GetMapping
    public ResponseEntity<String> adminPage(Authentication authentication) {

        String clerkId = getClerkId(authentication);

        if (!service.isAdmin(clerkId)) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        final String name = service.getByClerkIdOrThrow(clerkId).getName();

        return ResponseEntity.ok("Congrats, " + name + " — you're the admin. Try not to break everything. \uD83D\uDE0E");
    }

}
