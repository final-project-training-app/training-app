package com.example.trainingapp.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "workouts")
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "dashboard_name")
    private String dashboardName;

    @Column(name = "dashboard_description", columnDefinition = "TEXT")
    private String dashboardDescription;

    @Column(name = "subtitle_text", columnDefinition = "TEXT")
    private String subtitleText;

    @Column(name = "instructions_subtitle_text", columnDefinition = "TEXT")
    private String instructionsSubtitleText;

    private Integer level;
    private String type;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    private String instructionsAudio;
    private String workoutAudio;
    private String instructionsImage;
    private String workoutImage;
    private String instructionsVideo;
    private Integer instructionsVideoStart;
    private Integer instructionsVideoStop;
    private Boolean kneeFriendly;
    private Boolean lowImpact;
    private Boolean seated;
    private Boolean beginnerFriendly;

    @Column(nullable = false)
    private Boolean enabled = true;

    @ManyToOne
    @JoinColumn(name = "trainer_id")
    private Trainer trainer;


    @JsonProperty("durationSeconds")
    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    @JsonProperty("durationSeconds")
    public void setDurationSeconds(Integer durationSeconds) {
        if (durationSeconds == null) {
            this.durationSeconds = null;
            return;
        }

        if (durationSeconds < 0) {
            throw new IllegalArgumentException("durationSeconds cannot be negative");
        }
        this.durationSeconds = durationSeconds;
    }


}