package pi.integrated.quiz.dto;

import pi.integrated.quiz.model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponseDTO {
    
    private Long id;
    private String questionText;
    private QuestionType type;
    private List<String> options;
    private String correctAnswer;
    private Integer points;
    private String explanation;
    private Integer orderIndex;
    private Long quizId;
}
