package com.example.trainingapp.repository;

import com.example.trainingapp.entity.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainerRepository extends JpaRepository<Trainer, Long> {
	boolean existsByNameIgnoreCaseAndLanguageIgnoreCase(String name, String language);
}

