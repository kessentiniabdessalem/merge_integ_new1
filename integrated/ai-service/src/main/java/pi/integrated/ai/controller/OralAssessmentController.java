package pi.integrated.ai.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pi.integrated.ai.dto.OralAssessmentRequest;
import pi.integrated.ai.dto.OralAssessmentResponse;
import pi.integrated.ai.service.OralAssessmentService;

@RestController
@RequestMapping("/api/ai/oral-assessment")
@RequiredArgsConstructor
@Slf4j
public class OralAssessmentController {

    private final OralAssessmentService oralAssessmentService;

    @PostMapping("/evaluate")
    public ResponseEntity<OralAssessmentResponse> evaluate(@Valid @RequestBody OralAssessmentRequest request) {
        try {
            OralAssessmentResponse body = oralAssessmentService.evaluate(request);
            return ResponseEntity.ok(body);
        } catch (RuntimeException e) {
            log.error("Évaluation orale IA indisponible ou erreur Gemini", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
}
