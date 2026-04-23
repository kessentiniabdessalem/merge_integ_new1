package pi.integrated.quiz.service;

import pi.integrated.quiz.dto.QuizAttemptResponseDTO;
import pi.integrated.quiz.dto.QuizAttemptSubmitDTO;
import pi.integrated.quiz.model.Question;
import pi.integrated.quiz.model.QuestionType;
import pi.integrated.quiz.model.Quiz;
import pi.integrated.quiz.model.QuizAttempt;
import pi.integrated.quiz.repository.QuestionRepository;
import pi.integrated.quiz.repository.QuizAttemptRepository;
import pi.integrated.quiz.repository.QuizRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizAttemptServiceImplTest {
    
    @Mock
    private QuizAttemptRepository attemptRepository;
    
    @Mock
    private QuizRepository quizRepository;
    
    @Mock
    private QuestionRepository questionRepository;
    
    @InjectMocks
    private QuizAttemptServiceImpl attemptService;
    
    private Quiz quiz;
    private List<Question> questions;
    private QuizAttemptSubmitDTO submitDTO;
    
    @BeforeEach
    void setUp() {
        quiz = new Quiz();
        quiz.setId(1L);
        quiz.setTitle("Test Quiz");
        quiz.setPassingScore(70.0f);
        quiz.setTotalPoints(100);
        
        Question q1 = new Question();
        q1.setId(1L);
        q1.setQuestionText("What is 2+2?");
        q1.setType(QuestionType.SHORT_ANSWER);
        q1.setCorrectAnswer("4");
        q1.setPoints(50);
        q1.setQuiz(quiz);
        
        Question q2 = new Question();
        q2.setId(2L);
        q2.setQuestionText("Java is object-oriented");
        q2.setType(QuestionType.TRUE_FALSE);
        q2.setCorrectAnswer("True");
        q2.setPoints(50);
        q2.setQuiz(quiz);
        
        questions = Arrays.asList(q1, q2);
        
        Map<Long, String> answers = new HashMap<>();
        answers.put(1L, "4");
        answers.put(2L, "True");
        
        submitDTO = new QuizAttemptSubmitDTO();
        submitDTO.setQuizId(1L);
        submitDTO.setStudentId(101L);
        submitDTO.setStudentName("John Doe");
        submitDTO.setAnswers(answers);
        submitDTO.setTimeSpentMinutes(20);
    }
    
    @Test
    void submitAttempt_WithCorrectAnswers_ShouldPass() {
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(questionRepository.findByQuizIdOrderByOrderIndex(1L)).thenReturn(questions);
        
        QuizAttempt savedAttempt = new QuizAttempt();
        savedAttempt.setId(1L);
        savedAttempt.setQuiz(quiz);
        savedAttempt.setStudentId(101L);
        savedAttempt.setScore(100.0f);
        savedAttempt.setTotalPoints(100);
        savedAttempt.setPassed(true);
        
        when(attemptRepository.save(any(QuizAttempt.class))).thenReturn(savedAttempt);
        
        QuizAttemptResponseDTO result = attemptService.submitAttempt(submitDTO);
        
        assertNotNull(result);
        assertEquals(100.0f, result.getScore());
        assertTrue(result.getPassed());
        assertTrue(result.getMessage().contains("passed"));
        verify(attemptRepository, times(1)).save(any(QuizAttempt.class));
    }
    
    @Test
    void submitAttempt_WithWrongAnswers_ShouldFail() {
        Map<Long, String> wrongAnswers = new HashMap<>();
        wrongAnswers.put(1L, "5");
        wrongAnswers.put(2L, "False");
        submitDTO.setAnswers(wrongAnswers);
        
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(questionRepository.findByQuizIdOrderByOrderIndex(1L)).thenReturn(questions);
        
        QuizAttempt savedAttempt = new QuizAttempt();
        savedAttempt.setId(1L);
        savedAttempt.setQuiz(quiz);
        savedAttempt.setStudentId(101L);
        savedAttempt.setScore(0.0f);
        savedAttempt.setTotalPoints(100);
        savedAttempt.setPassed(false);
        
        when(attemptRepository.save(any(QuizAttempt.class))).thenReturn(savedAttempt);
        
        QuizAttemptResponseDTO result = attemptService.submitAttempt(submitDTO);
        
        assertNotNull(result);
        assertEquals(0.0f, result.getScore());
        assertFalse(result.getPassed());
        assertTrue(result.getMessage().contains("not pass"));
    }
}
