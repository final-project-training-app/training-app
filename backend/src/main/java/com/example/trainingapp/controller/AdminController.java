package com.example.trainingapp.controller;

import com.example.trainingapp.service.UserService;
import org.springframework.web.bind.annotation.CrossOrigin;
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

}
