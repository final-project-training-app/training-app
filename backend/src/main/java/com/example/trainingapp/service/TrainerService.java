package com.example.trainingapp.service;

import com.example.trainingapp.entity.Trainer;
import com.example.trainingapp.repository.TrainerRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class TrainerService {

    private final TrainerRepository trainerRepository;

    public TrainerService(TrainerRepository trainerRepository) {
        this.trainerRepository = trainerRepository;
    }

    public List<Trainer> getAllTrainers() {
        return trainerRepository.findAll();
    }

    public Trainer createTrainer(Trainer request) {
        if (request == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Request body is required");
        }

        String name = normalizeRequired(request.getName(), "name", 120);
        String prompt = normalizeRequired(request.getPrompt(), "prompt", 8000);
        String voice = normalizeRequired(request.getVoice(), "voice", 120);
        String intro = normalizeRequired(request.getIntro(), "intro", 2048);
        String language = normalizeRequired(request.getLanguage(), "language", 40);

        validateIntroUrl(intro);

        if (trainerRepository.existsByNameIgnoreCaseAndLanguageIgnoreCase(name, language)) {
            throw new ResponseStatusException(CONFLICT, "Trainer already exists for this language");
        }

        Trainer trainer = new Trainer();
        trainer.setName(name);
        trainer.setPrompt(prompt);
        trainer.setVoice(voice);
        trainer.setIntro(intro);
        trainer.setLanguage(language);
        trainer.setImageSelect(normalizeOptional(request.getImageSelect(), "imageSelect", 2048));
        trainer.setImageCall(normalizeOptional(request.getImageCall(), "imageCall", 2048));
        trainer.setImageStart(normalizeOptional(request.getImageStart(), "imageStart", 2048));

        return trainerRepository.save(trainer);
    }

    public Trainer updateTrainer(Long id, Trainer request) {
        validateId(id);

        if (request == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Request body is required");
        }

        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Trainer not found"));

        String name = normalizeRequired(request.getName(), "name", 120);
        String prompt = normalizeRequired(request.getPrompt(), "prompt", 8000);
        String voice = normalizeRequired(request.getVoice(), "voice", 120);
        String intro = normalizeRequired(request.getIntro(), "intro", 2048);
        String language = normalizeRequired(request.getLanguage(), "language", 40);

        validateIntroUrl(intro);

        if (trainerRepository.existsByNameIgnoreCaseAndLanguageIgnoreCase(name, language)
                && (!name.equalsIgnoreCase(trainer.getName())
                || !language.equalsIgnoreCase(trainer.getLanguage()))) {
            throw new ResponseStatusException(CONFLICT, "Trainer already exists for this language");
        }

        trainer.setName(name);
        trainer.setPrompt(prompt);
        trainer.setVoice(voice);
        trainer.setIntro(intro);
        trainer.setLanguage(language);
        trainer.setImageSelect(normalizeOptional(request.getImageSelect(), "imageSelect", 2048));
        trainer.setImageCall(normalizeOptional(request.getImageCall(), "imageCall", 2048));
        trainer.setImageStart(normalizeOptional(request.getImageStart(), "imageStart", 2048));

        return trainerRepository.save(trainer);
    }

    public Trainer getTrainerById(Long id) {
        validateId(id);
        return trainerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Trainer not found"));
    }

    public void deleteTrainer(Long id) {
        validateId(id);
        if (!trainerRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Trainer not found");
        }
        trainerRepository.deleteById(id);
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "id must be a positive number");
        }
    }

    private String normalizeRequired(String value, String fieldName, int maxLength) {
        if (value == null) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " is required");
        }

        String normalized = value.trim();
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " is required");
        }

        if (normalized.length() > maxLength) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " exceeds max length " + maxLength);
        }

        return normalized;
    }

    private String normalizeOptional(String value, String fieldName, int maxLength) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        if (normalized.isEmpty()) {
            return null;
        }

        if (normalized.length() > maxLength) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " exceeds max length " + maxLength);
        }

        return normalized;
    }

    private void validateIntroUrl(String intro) {
        URI uri;
        try {
            uri = URI.create(intro);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(BAD_REQUEST, "intro must be a valid URL");
        }

        String scheme = uri.getScheme();
        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
            throw new ResponseStatusException(BAD_REQUEST, "intro must use http or https");
        }

        if (uri.getHost() == null || uri.getHost().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "intro must include a valid host");
        }
    }
}
