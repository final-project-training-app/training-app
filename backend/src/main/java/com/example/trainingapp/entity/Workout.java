package com.example.trainingapp.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "workouts")
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String instructions;
    private Integer level;
    private String type;
    private Integer durationMinutes;
    private String instructionsAudio;
    private String workoutAudio;
    private String instructionsImage;
    private String workoutImage;
    private Boolean kneeFriendly;
    private Boolean lowImpact;
    private Boolean seated;
    private Boolean beginnerFriendly;

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

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
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

    public Boolean getKneeFriendly() {
        return kneeFriendly;
    }

    public void setKneeFriendly(Boolean kneeFriendly) {
        this.kneeFriendly = kneeFriendly;
    }

    public Boolean getLowImpact() {
        return lowImpact;
    }

    public void setLowImpact(Boolean lowImpact) {
        this.lowImpact = lowImpact;
    }

    public Boolean getSeated() {
        return seated;
    }

    public void setSeated(Boolean seated) {
        this.seated = seated;
    }

    public Boolean getBeginnerFriendly() {
        return beginnerFriendly;
    }

    public void setBeginnerFriendly(Boolean beginnerFriendly) {
        this.beginnerFriendly = beginnerFriendly;
    }
}