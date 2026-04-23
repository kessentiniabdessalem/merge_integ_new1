package pi.integrated.quiz.service;

import pi.integrated.quiz.dto.QuizAttemptResponseDTO;
import pi.integrated.quiz.dto.QuizAttemptSubmitDTO;

import java.util.List;

public interface QuizAttemptService {
    
    QuizAttemptResponseDTO submitAttempt(QuizAttemptSubmitDTO dto);
    
    List<QuizAttemptResponseDTO> getAttemptsByQuiz(Long quizId);
    
    List<QuizAttemptResponseDTO> getAttemptsByStudent(Long studentId);
    
    QuizAttemptResponseDTO getAttemptById(Long id);
}
