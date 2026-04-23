package pi.integrated.preevaluation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import pi.integrated.preevaluation.EnglishUsageFrequency;
import pi.integrated.preevaluation.LearningGoal;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PreevaluationProfileRequest {

    @NotNull
    private Boolean studiedBefore;

    @NotNull
    private EnglishUsageFrequency frequency;

    @NotNull
    private LearningGoal goal;
}
