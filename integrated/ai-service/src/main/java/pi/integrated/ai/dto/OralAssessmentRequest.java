package pi.integrated.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class OralAssessmentRequest {

    /** fr | en */
    @NotBlank
    private String language;

    /** B2 | C1 — niveau cible de l’entretien */
    @NotBlank
    private String targetLevel;

    @NotEmpty
    @Valid
    private List<OralAssessmentItem> items;

    /** Alertes sécurité pendant la session */
    private int securityStrikes;

    /** Session arrêtée pour fraude avant la fin */
    private boolean sessionTerminatedEarly;
}
