package pi.integrated.quiz.controller;

import pi.integrated.quiz.dto.QuizAttemptResponseDTO;
import pi.integrated.quiz.dto.QuizAttemptSubmitDTO;
import pi.integrated.quiz.service.QuizAttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class QuizAttemptController {
    
    private final QuizAttemptService attemptService;
    
    @PostMapping("/submit")
    public ResponseEntity<QuizAttemptResponseDTO> submitAttempt(@Valid @RequestBody QuizAttemptSubmitDTO dto) {
        return ResponseEntity.ok(attemptService.submitAttempt(dto));
    }
    
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuizAttemptResponseDTO>> getAttemptsByQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(attemptService.getAttemptsByQuiz(quizId));
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<QuizAttemptResponseDTO>> getAttemptsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attemptService.getAttemptsByStudent(studentId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<QuizAttemptResponseDTO> getAttemptById(@PathVariable Long id) {
        return ResponseEntity.ok(attemptService.getAttemptById(id));
    }
}
