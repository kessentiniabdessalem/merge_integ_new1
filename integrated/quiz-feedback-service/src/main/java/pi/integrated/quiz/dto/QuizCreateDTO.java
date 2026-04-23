package pi.integrated.quiz.dto;

import pi.integrated.quiz.model.QuizStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizCreateDTO {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    private Long tutorId;
    
    private Integer timeLimitMinutes;
    
    private Float passingScore;
    
    private Integer totalPoints;
    
    private QuizStatus status = QuizStatus.DRAFT;
}
