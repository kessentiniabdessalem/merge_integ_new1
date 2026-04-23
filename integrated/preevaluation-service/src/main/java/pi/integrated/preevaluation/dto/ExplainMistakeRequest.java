package pi.integrated.preevaluation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExplainMistakeRequest {
    @NotNull
    private Long questionId;
}
