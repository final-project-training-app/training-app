package com.example.trainingapp.entity;

import jakarta.persistence.*;

import java.util.List;

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

    @OneToMany(mappedBy = "trainer")
    private List<Workout> workouts;

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

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getVoice() {
        return voice;
    }

    public void setVoice(String voice) {
        this.voice = voice;
    }

    public String getIntro() {
        return intro;
    }

    public void setIntro(String intro) {
        this.intro = intro;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getImageSelect() {
        return imageSelect;
    }

    public void setImageSelect(String imageSelect) {
        this.imageSelect = imageSelect;
    }

    public String getImageCall() {
        return imageCall;
    }

    public void setImageCall(String imageCall) {
        this.imageCall = imageCall;
    }

    public String getImageStart() {
        return imageStart;
    }

    public void setImageStart(String imageStart) {
        this.imageStart = imageStart;
    }
}

