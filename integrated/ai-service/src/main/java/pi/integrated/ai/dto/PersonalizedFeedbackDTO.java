package pi.integrated.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalizedFeedbackDTO {
    private String overallFeedback;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> recommendations;
    private String motivationalMessage;
}
