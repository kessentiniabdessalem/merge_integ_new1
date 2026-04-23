package pi.integrated.preevaluation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreevaluationStatusResponse {
    private boolean completed;
    private boolean profileCompleted;
    private String finalLevel;
    private String activeLevel;
    private boolean needsPreevaluation;
    private boolean terminatedForCheating;
    private boolean fraudFirstStrikeConsumed;
}
