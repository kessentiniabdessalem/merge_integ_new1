package pi.integrated.preevaluation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncorrectAnswerItemDto {
    private Long questionId;
    private String questionText;
    private String selectedAnswerText;
    private String correctAnswerText;
    private String category;
    private String categoryLabel;
    private String level;
}
