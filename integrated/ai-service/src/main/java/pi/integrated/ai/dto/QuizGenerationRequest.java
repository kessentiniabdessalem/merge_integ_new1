package pi.integrated.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizGenerationRequest {
    private String topic;
    private String difficulty;
    private int questionCount;
    private String questionType;
}
