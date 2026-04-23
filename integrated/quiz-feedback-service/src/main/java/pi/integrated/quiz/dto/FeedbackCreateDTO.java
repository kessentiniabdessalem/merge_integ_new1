package pi.integrated.quiz.dto;

import pi.integrated.quiz.model.FeedbackType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackCreateDTO {
    
    private Long quizId;
    
    private Long courseId;
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    private String studentName;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;
    
    private String comment;
    
    @NotNull(message = "Feedback type is required")
    private FeedbackType type;
}
