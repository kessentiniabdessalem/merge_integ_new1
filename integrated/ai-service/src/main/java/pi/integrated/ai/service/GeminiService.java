package pi.integrated.ai.service;

import pi.integrated.ai.config.GeminiConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {
    
    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    
    private final GeminiConfig geminiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public GeminiService(GeminiConfig geminiConfig, RestTemplate restTemplate) {
        this.geminiConfig = geminiConfig;
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }
    
    public String chat(String systemPrompt, String userMessage) {
        try {
            String fullPrompt = systemPrompt + "\n\n" + userMessage;
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", fullPrompt);
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));
            
            requestBody.put("contents", List.of(content));
            
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("maxOutputTokens", 2048);
            requestBody.put("generationConfig", generationConfig);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // URL complète avec la clé API en query parameter (méthode officielle Gemini)
            String url = geminiConfig.getApiUrl() + "?key=" + geminiConfig.getApiKey();
            
            logger.info("Appel à Gemini API: {}", geminiConfig.getApiUrl());
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
            );
            
            logger.info("Réponse Gemini reçue avec status: {}", response.getStatusCode());
            
            JsonNode root = objectMapper.readTree(response.getBody());
            String result = root.path("candidates").get(0)
                      .path("content").path("parts").get(0)
                      .path("text").asText();
            
            logger.info("Texte extrait de la réponse Gemini (longueur: {})", result.length());
            return result;
                      
        } catch (HttpClientErrorException e) {
            logger.error("Erreur HTTP lors de l'appel à Gemini API: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Erreur API Gemini (code " + e.getStatusCode() + "): " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            logger.error("Erreur lors de l'appel à Gemini API", e);
            throw new RuntimeException("Erreur lors de l'appel à Gemini API: " + e.getMessage(), e);
        }
    }

    /**
     * Génération avec réponse JSON (évaluation CEFR, etc.). Température basse pour stabilité.
     */
    public String generateJson(String fullPrompt, double temperature, int maxOutputTokens) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", fullPrompt);
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));
            requestBody.put("contents", List.of(content));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", temperature);
            generationConfig.put("maxOutputTokens", maxOutputTokens);
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = geminiConfig.getApiUrl() + "?key=" + geminiConfig.getApiKey();

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            String result = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
            logger.info("Réponse JSON Gemini (longueur: {})", result.length());
            return result;
        } catch (HttpClientErrorException e) {
            logger.error("Gemini JSON HTTP {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Erreur API Gemini: " + e.getStatusCode(), e);
        } catch (Exception e) {
            logger.error("Gemini generateJson", e);
            throw new RuntimeException("Erreur API Gemini: " + e.getMessage(), e);
        }
    }
}
