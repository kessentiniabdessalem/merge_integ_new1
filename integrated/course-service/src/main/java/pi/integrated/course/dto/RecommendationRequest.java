package pi.integrated.course.dto;

import lombok.Data;

import java.util.Collections;
import java.util.List;

@Data
public class RecommendationRequest {
    /** CEFR level from preevaluation: A1, A2, B1, B2, C1, C2 */
    private String cefrLevel;
    /** Main weakness category from preevaluation: Grammar, Vocabulary, Reading */
    private String mainWeakness;
    /** Secondary weakness category: Grammar, Vocabulary, Reading (nullable) */
    private String secondaryWeakness;
    /** Course IDs the student has already completed — excluded from results */
    private List<Long> completedCourseIds = Collections.emptyList();
}
