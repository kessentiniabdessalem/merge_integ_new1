package pi.integrated.ai.service;

import pi.integrated.ai.dto.FeedbackAnalysisRequest;
import pi.integrated.ai.dto.FeedbackSuggestionRequest;
import pi.integrated.ai.dto.FeedbackSuggestionDTO;
import pi.integrated.ai.dto.PersonalizedFeedbackDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PersonalizedFeedbackService {
    
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;
    
    public PersonalizedFeedbackService(GeminiService geminiService) {
        this.geminiService = geminiService;
        this.objectMapper = new ObjectMapper();
    }
    
    public PersonalizedFeedbackDTO generateFeedback(FeedbackAnalysisRequest request) {
        String systemPrompt = buildSystemPrompt();
        String userMessage = buildUserMessage(request);
        
        try {
            String aiResponse = geminiService.chat(systemPrompt, userMessage);
            return parseAIResponse(aiResponse, request);
        } catch (Exception e) {
            return createFallbackFeedback(request);
        }
    }
    
    public FeedbackSuggestionDTO generateFeedbackSuggestions(FeedbackSuggestionRequest request) {
        String systemPrompt = buildSuggestionSystemPrompt();
        String userMessage = buildSuggestionUserMessage(request);
        
        try {
            String aiResponse = geminiService.chat(systemPrompt, userMessage);
            return parseSuggestionResponse(aiResponse, request);
        } catch (Exception e) {
            return createFallbackSuggestions(request);
        }
    }
    
    private String buildSystemPrompt() {
        return "You are a learning feedback assistant. Return ONLY valid JSON without any markdown formatting. " +
               "The JSON must have this structure:\n" +
               "{\n" +
               "  \"overallFeedback\": \"text\",\n" +
               "  \"strengths\": [\"strength1\"],\n" +
               "  \"weaknesses\": [\"weakness1\"],\n" +
               "  \"recommendations\": [\"rec1\"],\n" +
               "  \"motivationalMessage\": \"message\"\n" +
               "}";
    }
    
    private String buildUserMessage(FeedbackAnalysisRequest request) {
        double percentage = (double) request.getScore() / request.getTotalPoints() * 100;
        
        StringBuilder message = new StringBuilder();
        message.append(String.format("Analyze this quiz attempt for '%s'.\n", request.getQuizTitle()));
        message.append(String.format("Score: %d/%d (%.1f%%)\n", request.getScore(), request.getTotalPoints(), percentage));
        message.append("Questions:\n");
        
        for (FeedbackAnalysisRequest.QuestionResult result : request.getQuestionResults()) {
            message.append(String.format("- %s: %s (Correct: %s)\n", 
                result.getQuestionText(),
                result.isCorrect() ? "Correct" : "Incorrect",
                result.getCorrectAnswer()));
        }
        
        message.append("\nReturn ONLY the JSON, no other text.");
        return message.toString();
    }
    
    private PersonalizedFeedbackDTO parseAIResponse(String response, FeedbackAnalysisRequest request) {
        try {
            String jsonResponse = extractJSON(response);
            return objectMapper.readValue(jsonResponse, PersonalizedFeedbackDTO.class);
        } catch (Exception e) {
            return createFallbackFeedback(request);
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
    
    private PersonalizedFeedbackDTO createFallbackFeedback(FeedbackAnalysisRequest request) {
        double percentage = (double) request.getScore() / request.getTotalPoints() * 100;
        
        PersonalizedFeedbackDTO feedback = new PersonalizedFeedbackDTO();
        feedback.setOverallFeedback(String.format("You scored %.1f%% on this quiz.", percentage));
        
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        
        long correctCount = request.getQuestionResults().stream().filter(FeedbackAnalysisRequest.QuestionResult::isCorrect).count();
        if (correctCount > 0) {
            strengths.add("You answered " + correctCount + " questions correctly");
        }
        
        long incorrectCount = request.getQuestionResults().size() - correctCount;
        if (incorrectCount > 0) {
            weaknesses.add("Review the " + incorrectCount + " questions you missed");
        }
        
        feedback.setStrengths(strengths);
        feedback.setWeaknesses(weaknesses);
        feedback.setRecommendations(List.of("Review the quiz material", "Practice similar questions"));
        feedback.setMotivationalMessage(percentage >= 70 ? "Great job! Keep it up!" : "Keep practicing, you'll improve!");
        
        return feedback;
    }
    
    private String buildSuggestionSystemPrompt() {
        return "You are a helpful feedback suggestion assistant for students. Generate constructive feedback suggestions based on quiz performance. " +
               "Return ONLY valid JSON without any markdown formatting. " +
               "The JSON must have this structure:\n" +
               "{\n" +
               "  \"suggestions\": [\"suggestion1\", \"suggestion2\", \"suggestion3\"],\n" +
               "  \"tone\": \"encouraging|constructive|motivational\",\n" +
               "  \"focusArea\": \"strengths|improvements|general\"\n" +
               "}";
    }
    
    private String buildSuggestionUserMessage(FeedbackSuggestionRequest request) {
        double percentage = request.getTotalPoints() > 0 ? 
            (double) request.getScore() / request.getTotalPoints() * 100 : 0;
        
        StringBuilder message = new StringBuilder();
        message.append(String.format("Generate feedback suggestions for a student who took the quiz '%s'.\n", request.getQuizTitle()));
        message.append(String.format("Topic: %s\n", request.getTopic() != null ? request.getTopic() : "General"));
        message.append(String.format("Difficulty: %s\n", request.getDifficulty() != null ? request.getDifficulty() : "Medium"));
        message.append(String.format("Score: %d/%d (%.1f%%)\n", request.getScore(), request.getTotalPoints(), percentage));
        
        if (percentage >= 80) {
            message.append("The student performed excellently. Focus on encouragement and next steps.\n");
        } else if (percentage >= 60) {
            message.append("The student performed adequately. Focus on areas for improvement.\n");
        } else {
            message.append("The student needs more practice. Focus on motivation and specific study suggestions.\n");
        }
        
        message.append("Generate 3-5 helpful, specific, and encouraging feedback suggestions.\n");
        message.append("Return ONLY the JSON, no other text.");
        
        return message.toString();
    }
    
    private FeedbackSuggestionDTO parseSuggestionResponse(String response, FeedbackSuggestionRequest request) {
        try {
            String jsonResponse = extractJSON(response);
            return objectMapper.readValue(jsonResponse, FeedbackSuggestionDTO.class);
        } catch (Exception e) {
            return createFallbackSuggestions(request);
        }
    }
    
    private FeedbackSuggestionDTO createFallbackSuggestions(FeedbackSuggestionRequest request) {
        double percentage = request.getTotalPoints() > 0 ? 
            (double) request.getScore() / request.getTotalPoints() * 100 : 0;
        
        List<String> suggestions = new ArrayList<>();
        String tone;
        String focusArea;
        
        if (percentage >= 80) {
            suggestions.add("Excellent work! You've demonstrated a strong understanding of the material.");
            suggestions.add("Consider exploring more advanced topics in this subject area.");
            suggestions.add("Your performance shows you're ready for more challenging content.");
            tone = "encouraging";
            focusArea = "strengths";
        } else if (percentage >= 60) {
            suggestions.add("Good effort! You're on the right track with this material.");
            suggestions.add("Review the questions you missed to strengthen your understanding.");
            suggestions.add("Consider practicing similar problems to improve your confidence.");
            tone = "constructive";
            focusArea = "improvements";
        } else {
            suggestions.add("Don't be discouraged - learning takes time and practice.");
            suggestions.add("Focus on understanding the fundamental concepts first.");
            suggestions.add("Consider reviewing the course material and trying practice exercises.");
            suggestions.add("Ask for help from instructors or peers when needed.");
            tone = "motivational";
            focusArea = "improvements";
        }
        
        return new FeedbackSuggestionDTO(suggestions, tone, focusArea);
    }
}
