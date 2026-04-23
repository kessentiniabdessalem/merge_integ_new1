package pi.integrated.ai.service;

import pi.integrated.ai.dto.ChatRequest;
import pi.integrated.ai.dto.ChatResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatBotService {

    private final GeminiService geminiService;

    public ChatResponse chat(ChatRequest request) {
        try {
            String systemContext = """
                You are LearnBot, a friendly and knowledgeable AI learning assistant for an e-learning platform.
                Your role is to:
                - Help students understand concepts and topics
                - Provide study tips and learning strategies
                - Answer questions about courses, quizzes, and learning materials
                - Encourage and motivate students in their learning journey
                - Be concise, clear, and supportive in your responses
                - Use simple language and provide examples when helpful
                
                Keep responses focused and helpful. If you don't know something specific about the platform,
                be honest and suggest the student contact support or check the help section.
                """;

            String aiResponse = geminiService.chat(systemContext, request.getMessage());

            log.info("Generated chat response successfully");
            return new ChatResponse(null, aiResponse);

        } catch (Exception e) {
            log.error("Error generating chat response", e);
            return new ChatResponse(null, "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.");
        }
    }
}
