package pi.integrated.ai.controller;

import pi.integrated.ai.dto.ChatRequest;
import pi.integrated.ai.dto.ChatResponse;
import pi.integrated.ai.service.ChatBotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/chatbot")
@RequiredArgsConstructor
@Slf4j
public class ChatBotController {

    private final ChatBotService chatBotService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        log.info("Received chat request: {}", request.getMessage());
        try {
            ChatResponse response = chatBotService.chat(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing chat request", e);
            return ResponseEntity.internalServerError()
                    .body(new ChatResponse(null, "Sorry, I encountered an error. Please try again."));
        }
    }

    @GetMapping("/suggestions")
    public ResponseEntity<String[]> getSuggestions() {
        String[] suggestions = {
                "How can I improve my quiz scores?",
                "Explain the concept of...",
                "What are the best study techniques?",
                "Can you help me with this topic?",
                "Show me my progress summary"
        };
        return ResponseEntity.ok(suggestions);
    }
}
