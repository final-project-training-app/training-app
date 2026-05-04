package com.example.trainingapp.repository;

import com.example.trainingapp.entity.GreetingMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface GreetingRepository extends JpaRepository<GreetingMessage, Long> {

    Optional<GreetingMessage> findTopByOrderByIdAsc();
}

