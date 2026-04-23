package pi.integrated.quiz.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptSubmitDTO {
    
    @NotNull(message = "Quiz ID is required")
    private Long quizId;
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    private String studentName;
    
    @NotNull(message = "Answers are required")
    private Map<Long, String> answers;
    
    private Integer timeSpentMinutes;
}
