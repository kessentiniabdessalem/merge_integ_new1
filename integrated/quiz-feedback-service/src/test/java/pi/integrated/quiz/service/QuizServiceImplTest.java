package pi.integrated.quiz.service;

import pi.integrated.quiz.dto.QuizCreateDTO;
import pi.integrated.quiz.dto.QuizResponseDTO;
import pi.integrated.quiz.dto.QuizStatsDTO;
import pi.integrated.quiz.exception.ResourceNotFoundException;
import pi.integrated.quiz.model.Quiz;
import pi.integrated.quiz.model.QuizStatus;
import pi.integrated.quiz.repository.FeedbackRepository;
import pi.integrated.quiz.repository.QuestionRepository;
import pi.integrated.quiz.repository.QuizAttemptRepository;
import pi.integrated.quiz.repository.QuizRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizServiceImplTest {
    
    @Mock
    private QuizRepository quizRepository;
    
    @Mock
    private QuestionRepository questionRepository;
    
    @Mock
    private QuizAttemptRepository attemptRepository;
    
    @Mock
    private FeedbackRepository feedbackRepository;
    
    @InjectMocks
    private QuizServiceImpl quizService;
    
    private Quiz quiz;
    private QuizCreateDTO createDTO;
    
    @BeforeEach
    void setUp() {
        quiz = new Quiz();
        quiz.setId(1L);
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Test Description");
        quiz.setCourseId(1L);
        quiz.setTutorId(1L);
        quiz.setStatus(QuizStatus.DRAFT);
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setUpdatedAt(LocalDateTime.now());
        quiz.setQuestions(new ArrayList<>());
        quiz.setAttempts(new ArrayList<>());
        
        createDTO = new QuizCreateDTO();
        createDTO.setTitle("Test Quiz");
        createDTO.setDescription("Test Description");
        createDTO.setCourseId(1L);
        createDTO.setTutorId(1L);
        createDTO.setStatus(QuizStatus.DRAFT);
    }
    
    @Test
    void createQuiz_ShouldReturnQuizResponseDTO() {
        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);
        when(questionRepository.countByQuizId(1L)).thenReturn(0L);
        when(attemptRepository.getAverageScoreByQuizId(1L)).thenReturn(null);
        
        QuizResponseDTO result = quizService.createQuiz(createDTO);
        
        assertNotNull(result);
        assertEquals("Test Quiz", result.getTitle());
        assertEquals(QuizStatus.DRAFT, result.getStatus());
        verify(quizRepository, times(1)).save(any(Quiz.class));
    }
    
    @Test
    void getQuizById_WhenQuizExists_ShouldReturnQuiz() {
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(questionRepository.countByQuizId(1L)).thenReturn(5L);
        when(attemptRepository.getAverageScoreByQuizId(1L)).thenReturn(85.0);
        
        QuizResponseDTO result = quizService.getQuizById(1L);
        
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Quiz", result.getTitle());
        assertEquals(5L, result.getQuestionCount());
        assertEquals(85.0, result.getAverageScore());
    }
    
    @Test
    void getQuizById_WhenQuizNotFound_ShouldThrowException() {
        when(quizRepository.findById(999L)).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> {
            quizService.getQuizById(999L);
        });
    }
    
    @Test
    void deleteQuiz_WhenQuizExists_ShouldDeleteSuccessfully() {
        when(quizRepository.existsById(1L)).thenReturn(true);
        doNothing().when(quizRepository).deleteById(1L);
        
        assertDoesNotThrow(() -> quizService.deleteQuiz(1L));
        verify(quizRepository, times(1)).deleteById(1L);
    }
    
    @Test
    void publishQuiz_ShouldChangeStatusToPublished() {
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);
        when(questionRepository.countByQuizId(1L)).thenReturn(0L);
        when(attemptRepository.getAverageScoreByQuizId(1L)).thenReturn(null);
        
        QuizResponseDTO result = quizService.publishQuiz(1L);
        
        assertNotNull(result);
        verify(quizRepository, times(1)).save(any(Quiz.class));
    }
    
    @Test
    void getQuizStats_ShouldReturnCorrectStats() {
        when(quizRepository.existsById(1L)).thenReturn(true);
        when(attemptRepository.findByQuizId(1L)).thenReturn(new ArrayList<>());
        when(attemptRepository.getAverageScoreByQuizId(1L)).thenReturn(80.0);
        when(attemptRepository.countPassedAttemptsByQuizId(1L)).thenReturn(8L);
        when(feedbackRepository.getAverageRatingByQuizId(1L)).thenReturn(4.5);
        
        QuizStatsDTO stats = quizService.getQuizStats(1L);
        
        assertNotNull(stats);
        assertEquals(80.0, stats.getAverageScore());
        assertEquals(4.5, stats.getAverageRating());
    }
}
