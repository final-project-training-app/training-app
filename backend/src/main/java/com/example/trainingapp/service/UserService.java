package com.example.trainingapp.service;

import com.example.trainingapp.entity.User;
import com.example.trainingapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class UserService {

    private static final String DEFAULT_DISPLAY_NAME = "No name entered";

    private final UserRepository userRepository;
    private final int STARTING_INTENSITY = 2;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(String clerkId, String name) {
        String displayName = (name == null || name.isBlank())
                ? DEFAULT_DISPLAY_NAME
                : name.trim();

        return userRepository.findByClerkId(clerkId)
                .map(existingUser -> {
                    if (existingUser.getName() == null || existingUser.getName().isBlank()) {
                        existingUser.setName(displayName);
                        return userRepository.save(existingUser);
                    }

                    return existingUser;
                })
                .orElseGet(() -> userRepository.save(
                        new User(displayName, STARTING_INTENSITY, "", clerkId)
                ));
    }

    public Optional<User> findByClerkId(String clerkId) {
        return userRepository.findByClerkId(clerkId);
    }

    public User getByClerkIdOrThrow(String clerkId) {
        return userRepository.findByClerkId(clerkId)
                .orElseThrow(() ->
                        new ResponseStatusException(NOT_FOUND, "User not found")
                );
    }

    public User updateUserPreferencesByClerkId(
            String clerkId,
            String name,
            int intensityLevel,
            String context
    ) {
        User user = getByClerkIdOrThrow(clerkId);

        user.setName(name);
        user.setIntensityLevel(intensityLevel);
        user.setContext(context);

        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }
}
