package pi.integrated.preevaluation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pi.integrated.preevaluation.dto.*;
import pi.integrated.preevaluation.security.JwtUserPrincipal;

@RestController
@RequestMapping("/api/preevaluation")
@RequiredArgsConstructor
public class PreevaluationController {

    private final PreevaluationService preevaluationService;
    private final PreevaluationAiExplanationService preevaluationAiExplanationService;

    private static JwtUserPrincipal requirePrincipal(JwtUserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Bearer token");
        }
        return principal;
    }

    @GetMapping("/status")
    public PreevaluationStatusResponse status(@AuthenticationPrincipal JwtUserPrincipal principal) {
        JwtUserPrincipal p = requirePrincipal(principal);
        return preevaluationService.getStatus(p.getEmail(), p.getRole());
    }

    @PostMapping("/profile")
    public void saveProfile(@AuthenticationPrincipal JwtUserPrincipal principal,
                            @Valid @RequestBody PreevaluationProfileRequest request) {
        JwtUserPrincipal p = requirePrincipal(principal);
        preevaluationService.saveProfile(p.getEmail(), p.getRole(), request);
    }

    @PostMapping("/levels/{level}/start")
    public LevelStartResponse startLevel(@AuthenticationPrincipal JwtUserPrincipal principal,
                                         @PathVariable String level) {
        JwtUserPrincipal p = requirePrincipal(principal);
        EnglishLevel el = parseLevel(level);
        return preevaluationService.startLevel(p.getEmail(), p.getRole(), el);
    }

    @PostMapping("/levels/{level}/submit")
    public LevelSubmitResponse submitLevel(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable String level,
            @Valid @RequestBody LevelSubmitRequest request
    ) {
        JwtUserPrincipal p = requirePrincipal(principal);
        EnglishLevel el = parseLevel(level);
        return preevaluationService.submitLevel(p.getEmail(), p.getRole(), el, request);
    }

    @PostMapping("/fraud-report")
    public FraudReportResponse fraudReport(@AuthenticationPrincipal JwtUserPrincipal principal,
                                           @RequestBody(required = false) FraudReportRequest request) {
        JwtUserPrincipal p = requirePrincipal(principal);
        return preevaluationService.reportFraud(p.getEmail(), p.getRole(),
                request != null ? request : new FraudReportRequest());
    }

    @GetMapping("/result-review")
    public PreevaluationResultReviewResponse resultReview(@AuthenticationPrincipal JwtUserPrincipal principal) {
        JwtUserPrincipal p = requirePrincipal(principal);
        return preevaluationService.getResultReview(p.getEmail(), p.getRole());
    }

    @PostMapping("/ai/explain-mistake")
    public ExplainMistakeResponse explainMistake(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody ExplainMistakeRequest request
    ) {
        JwtUserPrincipal p = requirePrincipal(principal);
        return preevaluationAiExplanationService.explainMistake(p.getEmail(), p.getRole(), request);
    }

    @PostMapping("/ai/follow-up")
    public FollowUpChatResponse followUpChat(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody FollowUpChatRequest request
    ) {
        JwtUserPrincipal p = requirePrincipal(principal);
        return preevaluationAiExplanationService.followUpChat(p.getEmail(), p.getRole(), request);
    }

    private static EnglishLevel parseLevel(String level) {
        return EnglishLevel.valueOf(level.trim().toUpperCase());
    }
}
