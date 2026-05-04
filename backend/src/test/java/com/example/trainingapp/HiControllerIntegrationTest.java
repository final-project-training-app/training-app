package com.example.trainingapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.trainingapp.repository.GreetingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HiControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GreetingRepository greetingRepository;

    @BeforeEach
    void setUp() {
        greetingRepository.deleteAll();
    }

    @Test
    void sayHiReturnsPersistedGreeting() throws Exception {
        mockMvc.perform(get("/api/hi"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hi"));

        assertThat(greetingRepository.count()).isEqualTo(1);

        mockMvc.perform(get("/api/hi"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hi"));

        assertThat(greetingRepository.count()).isEqualTo(1);
    }
}

