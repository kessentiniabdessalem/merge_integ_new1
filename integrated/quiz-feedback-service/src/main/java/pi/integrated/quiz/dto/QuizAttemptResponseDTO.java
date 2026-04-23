package pi.integrated.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptResponseDTO {
    
    private Long id;
    private Long quizId;
    private Long studentId;
    private String studentName;
    private Float score;
    private Integer totalPoints;
    private Boolean passed;
    private String message;
    private Integer timeSpentMinutes;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
