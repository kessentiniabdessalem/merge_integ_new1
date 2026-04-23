package pi.integrated.preevaluation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pi.integrated.preevaluation.QuestionCategory;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionPublicDto {
    private Long id;
    private String text;
    private QuestionCategory category;
    private List<OptionPublicDto> options;
}
