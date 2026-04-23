package pi.integrated.quiz.controller;

import pi.integrated.quiz.dto.FeedbackCreateDTO;
import pi.integrated.quiz.dto.FeedbackResponseDTO;
import pi.integrated.quiz.model.FeedbackType;
import pi.integrated.quiz.service.FeedbackService;
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
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FeedbackController.class)
class FeedbackControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private FeedbackService feedbackService;
    
    private FeedbackResponseDTO feedbackResponse;
    private FeedbackCreateDTO feedbackCreate;
    
    @BeforeEach
    void setUp() {
        feedbackResponse = new FeedbackResponseDTO();
        feedbackResponse.setId(1L);
        feedbackResponse.setQuizId(1L);
        feedbackResponse.setStudentId(101L);
        feedbackResponse.setStudentName("John Doe");
        feedbackResponse.setRating(5);
        feedbackResponse.setComment("Excellent quiz!");
        feedbackResponse.setType(FeedbackType.QUIZ_FEEDBACK);
        feedbackResponse.setCreatedAt(LocalDateTime.now());
        
        feedbackCreate = new FeedbackCreateDTO();
        feedbackCreate.setQuizId(1L);
        feedbackCreate.setStudentId(101L);
        feedbackCreate.setStudentName("John Doe");
        feedbackCreate.setRating(5);
        feedbackCreate.setComment("Excellent quiz!");
        feedbackCreate.setType(FeedbackType.QUIZ_FEEDBACK);
    }
    
    @Test
    void getFeedbackByQuiz_ShouldReturnFeedbackList() throws Exception {
        List<FeedbackResponseDTO> feedbacks = Arrays.asList(feedbackResponse);
        when(feedbackService.getFeedbackByQuiz(1L)).thenReturn(feedbacks);
        
        mockMvc.perform(get("/api/feedbacks/quiz/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].rating").value(5));
        
        verify(feedbackService, times(1)).getFeedbackByQuiz(1L);
    }
    
    @Test
    void createFeedback_ShouldReturnCreatedFeedback() throws Exception {
        when(feedbackService.createFeedback(any(FeedbackCreateDTO.class))).thenReturn(feedbackResponse);
        
        mockMvc.perform(post("/api/feedbacks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(feedbackCreate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.rating").value(5));
        
        verify(feedbackService, times(1)).createFeedback(any(FeedbackCreateDTO.class));
    }
    
    @Test
    void getAverageRating_ShouldReturnAverage() throws Exception {
        when(feedbackService.getAverageRating(1L)).thenReturn(4.5);
        
        mockMvc.perform(get("/api/feedbacks/quiz/1/average"))
                .andExpect(status().isOk())
                .andExpect(content().string("4.5"));
        
        verify(feedbackService, times(1)).getAverageRating(1L);
    }
}
