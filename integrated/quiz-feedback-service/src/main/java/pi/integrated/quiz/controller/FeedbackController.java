package pi.integrated.quiz.controller;

import pi.integrated.quiz.dto.FeedbackCreateDTO;
import pi.integrated.quiz.dto.FeedbackResponseDTO;
import pi.integrated.quiz.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {
    
    private final FeedbackService feedbackService;
    
    @GetMapping
    public ResponseEntity<List<FeedbackResponseDTO>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FeedbackResponseDTO> getFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getFeedbackById(id));
    }
    
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByQuiz(quizId));
    }
    
    @GetMapping("/quiz/{quizId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long quizId) {
        return ResponseEntity.ok(feedbackService.getAverageRating(quizId));
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByCourse(courseId));
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByStudent(studentId));
    }
    
    @PostMapping
    public ResponseEntity<FeedbackResponseDTO> createFeedback(@Valid @RequestBody FeedbackCreateDTO dto) {
        return new ResponseEntity<>(feedbackService.createFeedback(dto), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FeedbackResponseDTO> updateFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackCreateDTO dto) {
        return ResponseEntity.ok(feedbackService.updateFeedback(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
