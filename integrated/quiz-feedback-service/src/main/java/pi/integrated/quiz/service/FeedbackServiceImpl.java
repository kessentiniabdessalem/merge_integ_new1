package pi.integrated.quiz.service;

import pi.integrated.quiz.dto.FeedbackCreateDTO;
import pi.integrated.quiz.dto.FeedbackResponseDTO;
import pi.integrated.quiz.exception.InappropriateContentException;
import pi.integrated.quiz.exception.ResourceNotFoundException;
import pi.integrated.quiz.model.Feedback;
import pi.integrated.quiz.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {
    
    private final FeedbackRepository feedbackRepository;
    private final ProfanityFilterService profanityFilterService;
    
    @Override
    @Transactional
    public FeedbackResponseDTO createFeedback(FeedbackCreateDTO dto) {
        // Vérifier le contenu inapproprié
        validateFeedbackContent(dto.getComment());
        
        Feedback feedback = new Feedback();
        feedback.setQuizId(dto.getQuizId());
        feedback.setCourseId(dto.getCourseId());
        feedback.setStudentId(dto.getStudentId());
        feedback.setStudentName(dto.getStudentName());
        feedback.setRating(dto.getRating());
        
        // Filtrer le commentaire (remplacer les mots inappropriés par des *)
        String filteredComment = profanityFilterService.filterProfanity(dto.getComment());
        feedback.setComment(filteredComment);
        
        feedback.setType(dto.getType());
        
        Feedback saved = feedbackRepository.save(feedback);
        return mapToResponseDTO(saved);
    }
    
    @Override
    public FeedbackResponseDTO getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback", "id", id));
        return mapToResponseDTO(feedback);
    }
    
    @Override
    public List<FeedbackResponseDTO> getAllFeedbacks() {
        return feedbackRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public FeedbackResponseDTO updateFeedback(Long id, FeedbackCreateDTO dto) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback", "id", id));
        
        if (dto.getRating() != null) feedback.setRating(dto.getRating());
        
        if (dto.getComment() != null) {
            // Vérifier le contenu inapproprié
            validateFeedbackContent(dto.getComment());
            // Filtrer le commentaire
            String filteredComment = profanityFilterService.filterProfanity(dto.getComment());
            feedback.setComment(filteredComment);
        }
        
        if (dto.getType() != null) feedback.setType(dto.getType());
        
        Feedback updated = feedbackRepository.save(feedback);
        return mapToResponseDTO(updated);
    }
    
    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new ResourceNotFoundException("Feedback", "id", id);
        }
        feedbackRepository.deleteById(id);
    }
    
    @Override
    public List<FeedbackResponseDTO> getFeedbackByQuiz(Long quizId) {
        return feedbackRepository.findByQuizId(quizId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackResponseDTO> getFeedbackByCourse(Long courseId) {
        return feedbackRepository.findByCourseId(courseId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackResponseDTO> getFeedbackByStudent(Long studentId) {
        return feedbackRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Double getAverageRating(Long quizId) {
        Double avg = feedbackRepository.getAverageRatingByQuizId(quizId);
        return avg != null ? avg : 0.0;
    }
    
    private FeedbackResponseDTO mapToResponseDTO(Feedback feedback) {
        return new FeedbackResponseDTO(
                feedback.getId(),
                feedback.getQuizId(),
                feedback.getCourseId(),
                feedback.getStudentId(),
                feedback.getStudentName(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getType(),
                feedback.getCreatedAt()
        );
    }
    
    /**
     * Valide le contenu du feedback pour détecter les mots inappropriés
     */
    private void validateFeedbackContent(String comment) {
        if (comment != null && !comment.trim().isEmpty()) {
            if (profanityFilterService.containsProfanity(comment)) {
                List<String> detectedWords = profanityFilterService.detectProfanity(comment);
                throw new InappropriateContentException(
                    "Le feedback contient du contenu inapproprié. Veuillez modifier votre commentaire.",
                    detectedWords
                );
            }
        }
    }
}
