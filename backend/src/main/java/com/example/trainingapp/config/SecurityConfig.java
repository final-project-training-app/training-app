package com.example.trainingapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                //.requestMatchers("/api/users/**").authenticated()
                .anyRequest().permitAll()
            )
            // Development convenience: permit all requests so frontend/ETeam can iterate
            // without authentication while we continue integration work.
            // NOTE: Re-enable `oauth2ResourceServer().jwt(...)` before deploying to staging/production.
            ;
        
        return http.build();
    }
}
