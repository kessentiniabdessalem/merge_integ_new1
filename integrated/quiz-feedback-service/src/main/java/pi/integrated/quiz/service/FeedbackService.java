package pi.integrated.quiz.service;

import pi.integrated.quiz.dto.FeedbackCreateDTO;
import pi.integrated.quiz.dto.FeedbackResponseDTO;

import java.util.List;

public interface FeedbackService {
    
    FeedbackResponseDTO createFeedback(FeedbackCreateDTO dto);
    
    FeedbackResponseDTO getFeedbackById(Long id);
    
    List<FeedbackResponseDTO> getAllFeedbacks();
    
    FeedbackResponseDTO updateFeedback(Long id, FeedbackCreateDTO dto);
    
    void deleteFeedback(Long id);
    
    List<FeedbackResponseDTO> getFeedbackByQuiz(Long quizId);
    
    List<FeedbackResponseDTO> getFeedbackByCourse(Long courseId);
    
    List<FeedbackResponseDTO> getFeedbackByStudent(Long studentId);
    
    Double getAverageRating(Long quizId);
}
