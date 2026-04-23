package pi.integrated.preevaluation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pi.integrated.preevaluation.EnglishLevel;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LevelStartResponse {
    private EnglishLevel level;
    private int expectedCount;
    private List<QuestionPublicDto> questions;
}
