package com.example.trainingapp.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "trainers")
public class Trainer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String prompt;

    private String voice;

    private String intro;

    private String language;

    private String imageSelect;

    private String imageCall;

    private String imageStart;

    private String ambience;

    @OneToMany(mappedBy = "trainer")
    private List<Workout> workouts;
}

