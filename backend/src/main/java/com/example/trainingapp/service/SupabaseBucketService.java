package com.example.trainingapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SupabaseBucketService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api-key}")
    private String apiKey;

    @Value("${supabase.bucket-name}")
    private String bucketName;

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        return headers;
    }

    public void uploadFile(String fileName, byte[] fileContent) {
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;
        HttpHeaders headers = getHeaders();
        HttpEntity<byte[]> entity = new HttpEntity<>(fileContent, headers);
        restTemplate.postForObject(url, entity, String.class);
    }

    public void deleteFile(String fileName) {
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;
        HttpEntity<String> entity = new HttpEntity<>(getHeaders());
        restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
    }

    public String getPublicUrl(String fileName) {
        return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
    }
}