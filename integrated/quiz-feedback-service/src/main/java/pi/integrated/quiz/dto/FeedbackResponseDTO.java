package pi.integrated.quiz.dto;

import pi.integrated.quiz.model.FeedbackType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseDTO {
    
    private Long id;
    private Long quizId;
    private Long courseId;
    private Long studentId;
    private String studentName;
    private Integer rating;
    private String comment;
    private FeedbackType type;
    private LocalDateTime createdAt;
}
