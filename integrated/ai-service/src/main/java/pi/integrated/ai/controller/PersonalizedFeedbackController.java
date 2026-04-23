package pi.integrated.ai.controller;

import pi.integrated.ai.dto.FeedbackAnalysisRequest;
import pi.integrated.ai.dto.FeedbackSuggestionRequest;
import pi.integrated.ai.dto.FeedbackSuggestionDTO;
import pi.integrated.ai.dto.PersonalizedFeedbackDTO;
import pi.integrated.ai.service.PersonalizedFeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/feedback")
public class PersonalizedFeedbackController {
    
    private final PersonalizedFeedbackService feedbackService;
    
    public PersonalizedFeedbackController(PersonalizedFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }
    
    @PostMapping("/analyze")
    public ResponseEntity<PersonalizedFeedbackDTO> analyzeFeedback(@RequestBody FeedbackAnalysisRequest request) {
        PersonalizedFeedbackDTO feedback = feedbackService.generateFeedback(request);
        return ResponseEntity.ok(feedback);
    }
    
    @PostMapping("/suggestions")
    public ResponseEntity<FeedbackSuggestionDTO> generateSuggestions(@RequestBody FeedbackSuggestionRequest request) {
        FeedbackSuggestionDTO suggestions = feedbackService.generateFeedbackSuggestions(request);
        return ResponseEntity.ok(suggestions);
    }
}
