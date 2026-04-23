package pi.integrated.preevaluation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreevaluationResultReviewResponse {
    private String finalLevel;
    private String failedLevel;
    private List<IncorrectAnswerItemDto> incorrectAnswers;
    private String mainWeakness;
    private String secondaryWeakness;
    private String readingAssessment;
    private List<String> globalSummaryLines;
}
