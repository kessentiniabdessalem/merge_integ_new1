package pi.integrated.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedQuizDTO {
    private String title;
    private String description;
    private Integer suggestedPassingScore;
    private Integer suggestedTimeLimit;
    private List<GeneratedQuestionDTO> questions;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeneratedQuestionDTO {
        private String text;
        private String type;
        private List<String> options;
        private String correctAnswer;
        private int points;
        private String explanation;
    }
}
