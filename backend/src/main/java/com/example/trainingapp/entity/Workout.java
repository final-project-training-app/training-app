package com.example.trainingapp.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String instructions;
    private String instructionsAudio;
    private String workoutAudio;
    private String instructionsImage;
    private String workoutImage;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getInstructionsAudio() {
        return instructionsAudio;
    }

    public void setInstructionsAudio(String instructionsAudio) {
        this.instructionsAudio = instructionsAudio;
    }

    public String getWorkoutAudio() {
        return workoutAudio;
    }

    public void setWorkoutAudio(String workoutAudio) {
        this.workoutAudio = workoutAudio;
    }

    public String getInstructionsImage() {
        return instructionsImage;
    }

    public void setInstructionsImage(String instructionsImage) {
        this.instructionsImage = instructionsImage;
    }

    public String getWorkoutImage() {
        return workoutImage;
    }

    public void setWorkoutImage(String workoutImage) {
        this.workoutImage = workoutImage;
    }
}