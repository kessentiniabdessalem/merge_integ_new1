package pi.integrated.quiz.service;

import pi.integrated.quiz.dto.*;
import pi.integrated.quiz.model.Quiz;

import java.util.List;

public interface QuizService {
    
    QuizResponseDTO createQuiz(QuizCreateDTO dto);
    
    QuizResponseDTO getQuizById(Long id);
    
    List<QuizResponseDTO> getAllQuizzes();
    
    QuizResponseDTO updateQuiz(Long id, QuizUpdateDTO dto);
    
    void deleteQuiz(Long id);
    
    List<QuizResponseDTO> getQuizzesByCourse(Long courseId);
    
    List<QuizResponseDTO> getPublishedQuizzes();
    
    QuizResponseDTO publishQuiz(Long id);
    
    QuizResponseDTO archiveQuiz(Long id);
    
    Quiz getQuizWithQuestions(Long id);
    
    QuizStatsDTO getQuizStats(Long id);
}
