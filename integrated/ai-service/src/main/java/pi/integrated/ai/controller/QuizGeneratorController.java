package pi.integrated.ai.controller;

import pi.integrated.ai.dto.GeneratedQuizDTO;
import pi.integrated.ai.dto.QuizGenerationRequest;
import pi.integrated.ai.service.QuizGeneratorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/quiz")
public class QuizGeneratorController {
    
    private static final Logger logger = LoggerFactory.getLogger(QuizGeneratorController.class);
    private final QuizGeneratorService quizGeneratorService;
    
    public QuizGeneratorController(QuizGeneratorService quizGeneratorService) {
        this.quizGeneratorService = quizGeneratorService;
    }
    
    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(@RequestBody QuizGenerationRequest request) {
        try {
            logger.info("Génération de quiz demandée: topic={}, difficulty={}, count={}", 
                request.getTopic(), request.getDifficulty(), request.getQuestionCount());
            
            GeneratedQuizDTO quiz = quizGeneratorService.generateQuiz(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(quiz);
        } catch (Exception e) {
            logger.error("Erreur lors de la génération du quiz", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("details", e.getCause() != null ? e.getCause().getMessage() : "");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/topics")
    public ResponseEntity<List<String>> getSuggestedTopics() {
        return ResponseEntity.ok(quizGeneratorService.getSuggestedTopics());
    }
}