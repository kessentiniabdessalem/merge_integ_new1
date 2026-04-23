package pi.integrated.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Niveau CEFR évalué par le modèle (Gemini) à partir des réponses textuelles.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OralAssessmentResponse {

    private String cefrLevel;
    /** 0–1 */
    private double confidence;
    private List<String> strengthsFr;
    private List<String> weaknessesFr;
    private String summaryFr;
    private String summaryEn;
    private String provider;
}
