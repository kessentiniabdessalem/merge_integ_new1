package pi.integrated.ai.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.integrated.ai.dto.EventPredictionRequest;
import pi.integrated.ai.dto.EventPredictionResponse;
import pi.integrated.ai.dto.EventRecommendationRequest;
import pi.integrated.ai.dto.EventRecommendedEvent;
import pi.integrated.ai.service.EventPredictionService;
import pi.integrated.ai.service.EventRecommendationService;

import java.util.List;

@RestController
@RequestMapping("/api/ai/events")
public class EventAIController {

    @Autowired
    private EventPredictionService eventPredictionService;

    @Autowired
    private EventRecommendationService eventRecommendationService;

    @PostMapping("/predict")
    public ResponseEntity<EventPredictionResponse> predictCompletion(
            @RequestBody EventPredictionRequest request) {
        EventPredictionResponse response = eventPredictionService.predictEventCompletion(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/recommend")
    public ResponseEntity<List<EventRecommendedEvent>> recommendEvents(
            @RequestBody EventRecommendationRequest request) {
        List<EventRecommendedEvent> recommendations = eventRecommendationService.recommendEvents(request);
        return ResponseEntity.ok(recommendations);
    }
}
