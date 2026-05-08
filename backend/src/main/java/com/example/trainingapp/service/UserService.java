package com.example.trainingapp.service;

import com.example.trainingapp.dto.UserRequestDTO;
import com.example.trainingapp.entity.User;
import com.example.trainingapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final int STARTING_INTENSITY = 2;


    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(String clerkId, String name) {

        return userRepository.save(new User(name, STARTING_INTENSITY,"",clerkId));
    }

    public Optional<User> findByClerkId(String clerkId) {
        return userRepository.findByClerkId(clerkId);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }

    public User updateUserPreferences(Long id, User userRequest) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        existingUser.setIntensityLevel(userRequest.getIntensityLevel());
        existingUser.setContext(userRequest.getContext());

        return userRepository.save(existingUser);
    }
}
