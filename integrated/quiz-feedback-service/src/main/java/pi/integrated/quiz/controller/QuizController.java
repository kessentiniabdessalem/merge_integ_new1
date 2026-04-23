package pi.integrated.quiz.controller;

import pi.integrated.quiz.dto.*;
import pi.integrated.quiz.model.Quiz;
import pi.integrated.quiz.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {
    
    private final QuizService quizService;
    
    @GetMapping
    public ResponseEntity<List<QuizResponseDTO>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<QuizResponseDTO> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }
    
    @GetMapping("/{id}/full")
    public ResponseEntity<Quiz> getQuizWithQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizWithQuestions(id));
    }
    
    @GetMapping("/{id}/stats")
    public ResponseEntity<QuizStatsDTO> getQuizStats(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizStats(id));
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<QuizResponseDTO>> getQuizzesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizService.getQuizzesByCourse(courseId));
    }
    
    @GetMapping("/published")
    public ResponseEntity<List<QuizResponseDTO>> getPublishedQuizzes() {
        return ResponseEntity.ok(quizService.getPublishedQuizzes());
    }
    
    @PostMapping
    public ResponseEntity<QuizResponseDTO> createQuiz(@Valid @RequestBody QuizCreateDTO dto) {
        return new ResponseEntity<>(quizService.createQuiz(dto), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<QuizResponseDTO> updateQuiz(
            @PathVariable Long id,
            @RequestBody QuizUpdateDTO dto) {
        return ResponseEntity.ok(quizService.updateQuiz(id, dto));
    }
    
    @PutMapping("/{id}/publish")
    public ResponseEntity<QuizResponseDTO> publishQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.publishQuiz(id));
    }
    
    @PutMapping("/{id}/archive")
    public ResponseEntity<QuizResponseDTO> archiveQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.archiveQuiz(id));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }
}
