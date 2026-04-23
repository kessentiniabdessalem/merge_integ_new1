package pi.integrated.ai.service;

import pi.integrated.ai.dto.GeneratedQuizDTO;
import pi.integrated.ai.dto.QuizGenerationRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuizGeneratorService {
    
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;
    
    public QuizGeneratorService(GeminiService geminiService) {
        this.geminiService = geminiService;
        this.objectMapper = new ObjectMapper();
    }
    
    public GeneratedQuizDTO generateQuiz(QuizGenerationRequest request) {
        String systemPrompt = buildSystemPrompt();
        String userMessage = buildUserMessage(request);
        
        try {
            String aiResponse = geminiService.chat(systemPrompt, userMessage);
            return parseAIResponse(aiResponse, request);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du quiz: " + e.getMessage(), e);
        }
    }
    
    private String buildSystemPrompt() {
        return "You are a quiz generator. Return ONLY valid JSON without any markdown formatting or code blocks. " +
               "The JSON must have this exact structure:\n" +
               "{\n" +
               "  \"title\": \"string\",\n" +
               "  \"description\": \"string\",\n" +
               "  \"suggestedPassingScore\": 70,\n" +
               "  \"suggestedTimeLimit\": 15,\n" +
               "  \"questions\": [\n" +
               "    {\n" +
               "      \"text\": \"question text\",\n" +
               "      \"type\": \"MULTIPLE_CHOICE\",\n" +
               "      \"options\": [\"A\", \"B\", \"C\", \"D\"],\n" +
               "      \"correctAnswer\": \"A\",\n" +
               "      \"explanation\": \"why A is correct\",\n" +
               "      \"points\": 2\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
    
    private String buildUserMessage(QuizGenerationRequest request) {
        return String.format(
            "Generate a quiz with these requirements:\n" +
            "- Topic: %s\n" +
            "- Difficulty: %s\n" +
            "- Number of questions: %d\n" +
            "- Question type: %s\n" +
            "Return ONLY the JSON, no other text.",
            request.getTopic(),
            request.getDifficulty(),
            request.getQuestionCount(),
            request.getQuestionType()
        );
    }
    
    private GeneratedQuizDTO parseAIResponse(String response, QuizGenerationRequest request) {
        try {
            String jsonResponse = extractJSON(response);
            return objectMapper.readValue(jsonResponse, GeneratedQuizDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du parsing de la réponse: " + e.getMessage(), e);
        }
    }
    
    private String extractJSON(String response) {
        response = response.trim();
        if (response.startsWith("```json")) {
            response = response.substring(7);
        }
        if (response.startsWith("```")) {
            response = response.substring(3);
        }
        if (response.endsWith("```")) {
            response = response.substring(0, response.length() - 3);
        }
        
        int start = response.indexOf("{");
        int end = response.lastIndexOf("}") + 1;
        if (start >= 0 && end > start) {
            return response.substring(start, end);
        }
        return response.trim();
    }
    
    public List<String> getSuggestedTopics() {
        return List.of(
            "Java OOP",
            "Python Basics",
            "JavaScript ES6",
            "SQL Fundamentals",
            "Data Structures",
            "Algorithms",
            "Web Development",
            "Machine Learning",
            "Cloud Computing",
            "Cybersecurity"
        );
    }
}
