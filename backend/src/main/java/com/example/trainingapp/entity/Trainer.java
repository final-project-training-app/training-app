package com.example.trainingapp.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table
@Data
public class Trainer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id1;
    private String name;

    public Trainer(String name) {
        this.name = name;
    }

    public Trainer() {

    }
}

