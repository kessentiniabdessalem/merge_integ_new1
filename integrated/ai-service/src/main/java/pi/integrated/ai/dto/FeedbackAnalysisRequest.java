package pi.integrated.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackAnalysisRequest {
    private Long attemptId;
    private String quizTitle;
    private int score;
    private int totalPoints;
    private List<QuestionResult> questionResults;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResult {
        private String questionText;
        private String userAnswer;
        private String correctAnswer;
        private boolean isCorrect;
    }
}
