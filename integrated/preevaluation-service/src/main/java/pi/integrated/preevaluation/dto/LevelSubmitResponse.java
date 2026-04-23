package pi.integrated.preevaluation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pi.integrated.preevaluation.EnglishLevel;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LevelSubmitResponse {
    private int score;
    private boolean passed;
    private boolean finished;
    private EnglishLevel finalLevel;
    private EnglishLevel nextLevel;
}
