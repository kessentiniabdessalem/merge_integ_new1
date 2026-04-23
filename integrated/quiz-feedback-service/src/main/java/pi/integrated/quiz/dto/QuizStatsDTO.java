package pi.integrated.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizStatsDTO {
    
    private Long totalAttempts;
    private Double averageScore;
    private Double passRate;
    private Double averageRating;
}
