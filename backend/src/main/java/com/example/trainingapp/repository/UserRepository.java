package com.example.trainingapp.repository;

import com.example.trainingapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByClerkId(String clerkId);
}

