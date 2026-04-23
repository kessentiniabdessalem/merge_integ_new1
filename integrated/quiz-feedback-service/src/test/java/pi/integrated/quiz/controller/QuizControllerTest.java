package pi.integrated.quiz.controller;

import pi.integrated.quiz.dto.QuizCreateDTO;
import pi.integrated.quiz.dto.QuizResponseDTO;
import pi.integrated.quiz.model.QuizStatus;
import pi.integrated.quiz.service.QuizService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuizController.class)
class QuizControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private QuizService quizService;
    
    private QuizResponseDTO quizResponse;
    private QuizCreateDTO quizCreate;
    
    @BeforeEach
    void setUp() {
        quizResponse = new QuizResponseDTO();
        quizResponse.setId(1L);
        quizResponse.setTitle("Test Quiz");
        quizResponse.setDescription("Test Description");
        quizResponse.setCourseId(1L);
        quizResponse.setStatus(QuizStatus.DRAFT);
        quizResponse.setCreatedAt(LocalDateTime.now());
        quizResponse.setQuestionCount(5L);
        quizResponse.setAverageScore(85.0);
        
        quizCreate = new QuizCreateDTO();
        quizCreate.setTitle("Test Quiz");
        quizCreate.setDescription("Test Description");
        quizCreate.setCourseId(1L);
        quizCreate.setStatus(QuizStatus.DRAFT);
    }
    
    @Test
    void getAllQuizzes_ShouldReturnQuizList() throws Exception {
        List<QuizResponseDTO> quizzes = Arrays.asList(quizResponse);
        when(quizService.getAllQuizzes()).thenReturn(quizzes);
        
        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Test Quiz"));
        
        verify(quizService, times(1)).getAllQuizzes();
    }
    
    @Test
    void getQuizById_ShouldReturnQuiz() throws Exception {
        when(quizService.getQuizById(1L)).thenReturn(quizResponse);
        
        mockMvc.perform(get("/api/quizzes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Quiz"));
        
        verify(quizService, times(1)).getQuizById(1L);
    }
    
    @Test
    void createQuiz_ShouldReturnCreatedQuiz() throws Exception {
        when(quizService.createQuiz(any(QuizCreateDTO.class))).thenReturn(quizResponse);
        
        mockMvc.perform(post("/api/quizzes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(quizCreate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Quiz"));
        
        verify(quizService, times(1)).createQuiz(any(QuizCreateDTO.class));
    }
    
    @Test
    void deleteQuiz_ShouldReturnNoContent() throws Exception {
        doNothing().when(quizService).deleteQuiz(1L);
        
        mockMvc.perform(delete("/api/quizzes/1"))
                .andExpect(status().isNoContent());
        
        verify(quizService, times(1)).deleteQuiz(1L);
    }
}
