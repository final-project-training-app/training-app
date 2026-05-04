package com.example.trainingapp.service;

import com.example.trainingapp.entity.GreetingMessage;
import com.example.trainingapp.repository.GreetingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HiService {

    private static final String DEFAULT_MESSAGE = "Hi from Spring Boot + PostgreSQL!";

    private final GreetingRepository greetingRepository;

    public HiService(GreetingRepository greetingRepository) {
        this.greetingRepository = greetingRepository;
    }

    public GreetingMessage getOrCreateGreeting() {
        return greetingRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> greetingRepository.save(new GreetingMessage(DEFAULT_MESSAGE)));
    }
}

