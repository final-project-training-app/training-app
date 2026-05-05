package com.example.trainingapp.controller;

import com.example.trainingapp.service.HiService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class HiController {

    private final HiService hiService;

    public HiController(HiService hiService) {
        this.hiService = hiService;
    }

    @GetMapping("/hi")
    public String sayHi() {
        return hiService.getOrCreateGreeting().getMessage();
    }
}

