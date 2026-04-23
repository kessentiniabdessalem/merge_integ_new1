package pi.integrated.quiz.service;

import pi.integrated.quiz.dto.QuestionCreateDTO;
import pi.integrated.quiz.dto.QuestionResponseDTO;
import pi.integrated.quiz.dto.QuestionUpdateDTO;

import java.util.List;

public interface QuestionService {
    
    QuestionResponseDTO addQuestion(QuestionCreateDTO dto);
    
    QuestionResponseDTO getQuestion(Long id);
    
    QuestionResponseDTO updateQuestion(Long id, QuestionUpdateDTO dto);
    
    void deleteQuestion(Long id);
    
    List<QuestionResponseDTO> getQuestionsByQuiz(Long quizId);
    
    void reorderQuestions(Long quizId, List<Long> orderedIds);
}
