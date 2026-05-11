package com.example.trainingapp.entity;

import jakarta.persistence.*;

@Entity
@Table
public class Trainer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    public Trainer(String name) {
        this.name = name;
    }

    public Trainer() {

    }
}

