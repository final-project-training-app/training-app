package com.example.trainingapp.service;

import com.example.trainingapp.entity.GreetingMessage;
import com.example.trainingapp.repository.GreetingRepository;
import org.springframework.stereotype.Service;

@Service
public class HiService {

    private static final String DEFAULT_MESSAGE = "https://mizofvemlvooaycnevys.supabase.co/storage/v1/object/public/audio_files/ElevenLabs_sample_instructions_jj-pvc.mp3";

    private final GreetingRepository greetingRepository;

    public HiService(GreetingRepository greetingRepository) {
        this.greetingRepository = greetingRepository;
    }

    public GreetingMessage getOrCreateGreeting() {
        return greetingRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> greetingRepository.save(new GreetingMessage(DEFAULT_MESSAGE)));
    }
}

