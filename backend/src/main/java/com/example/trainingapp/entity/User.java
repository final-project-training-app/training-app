package com.example.trainingapp.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {

    private static final Long DEFAULT_TRAINER_ID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Integer intensityLevel;
    private String context;
    @Column(unique = true)
    private String clerkId;
    private String role;
    private Long trainerId;

    public User() {
    }

    public User(String name, Integer intensityLevel, String context, String clerkId) {
        this.name = name;
        this.intensityLevel = intensityLevel;
        this.context = context;
        this.clerkId = clerkId;
        this.role = "USER";
        this.trainerId = DEFAULT_TRAINER_ID;
    }
}
