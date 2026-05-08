package com.example.trainingapp.dto;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public record UserRequestDTO(JwtAuthenticationToken token) {
}
