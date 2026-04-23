package pi.integrated.quiz.dto;

import pi.integrated.quiz.model.QuizStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizUpdateDTO {
    
    private String title;
    
    private String description;
    
    private Long courseId;
    
    private Long tutorId;
    
    private Integer timeLimitMinutes;
    
    private Float passingScore;
    
    private Integer totalPoints;
    
    private QuizStatus status;
}
