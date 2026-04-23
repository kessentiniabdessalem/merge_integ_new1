package pi.integrated.quiz.service;

import pi.integrated.quiz.dto.FeedbackCreateDTO;
import pi.integrated.quiz.dto.FeedbackResponseDTO;
import pi.integrated.quiz.exception.ResourceNotFoundException;
import pi.integrated.quiz.model.Feedback;
import pi.integrated.quiz.model.FeedbackType;
import pi.integrated.quiz.repository.FeedbackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceImplTest {
    
    @Mock
    private FeedbackRepository feedbackRepository;
    
    @InjectMocks
    private FeedbackServiceImpl feedbackService;
    
    private Feedback feedback;
    private FeedbackCreateDTO createDTO;
    
    @BeforeEach
    void setUp() {
        feedback = new Feedback();
        feedback.setId(1L);
        feedback.setQuizId(1L);
        feedback.setStudentId(101L);
        feedback.setStudentName("John Doe");
        feedback.setRating(5);
        feedback.setComment("Excellent quiz!");
        feedback.setType(FeedbackType.QUIZ_FEEDBACK);
        feedback.setCreatedAt(LocalDateTime.now());
        
        createDTO = new FeedbackCreateDTO();
        createDTO.setQuizId(1L);
        createDTO.setStudentId(101L);
        createDTO.setStudentName("John Doe");
        createDTO.setRating(5);
        createDTO.setComment("Excellent quiz!");
        createDTO.setType(FeedbackType.QUIZ_FEEDBACK);
    }
    
    @Test
    void createFeedback_ShouldReturnFeedbackResponseDTO() {
        when(feedbackRepository.save(any(Feedback.class))).thenReturn(feedback);
        
        FeedbackResponseDTO result = feedbackService.createFeedback(createDTO);
        
        assertNotNull(result);
        assertEquals(5, result.getRating());
        assertEquals("Excellent quiz!", result.getComment());
        verify(feedbackRepository, times(1)).save(any(Feedback.class));
    }
    
    @Test
    void getFeedbackById_WhenExists_ShouldReturnFeedback() {
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));
        
        FeedbackResponseDTO result = feedbackService.getFeedbackById(1L);
        
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(5, result.getRating());
    }
    
    @Test
    void getFeedbackById_WhenNotFound_ShouldThrowException() {
        when(feedbackRepository.findById(999L)).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> {
            feedbackService.getFeedbackById(999L);
        });
    }
    
    @Test
    void getAverageRating_ShouldReturnCorrectAverage() {
        when(feedbackRepository.getAverageRatingByQuizId(1L)).thenReturn(4.5);
        
        Double average = feedbackService.getAverageRating(1L);
        
        assertEquals(4.5, average);
    }
    
    @Test
    void getAverageRating_WhenNoFeedback_ShouldReturnZero() {
        when(feedbackRepository.getAverageRatingByQuizId(1L)).thenReturn(null);
        
        Double average = feedbackService.getAverageRating(1L);
        
        assertEquals(0.0, average);
    }
}
