package pi.integrated.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pi.integrated.ai.dto.EventPredictionRequest;
import pi.integrated.ai.dto.EventPredictionResponse;

@Service
public class EventPredictionService {

    private static final Logger logger = LoggerFactory.getLogger(EventPredictionService.class);

    @Autowired
    private GeminiService geminiService;

    public EventPredictionResponse predictEventCompletion(EventPredictionRequest request) {
        try {
            return predictWithGemini(request);
        } catch (Exception e) {
            logger.warn("Gemini AI failed for prediction, using fallback: {}", e.getMessage());
            return predictWithFallbackLogic(request);
        }
    }

    private EventPredictionResponse predictWithGemini(EventPredictionRequest request) {
        String systemPrompt = "You are an AI assistant that analyzes events and predicts if they will sell out soon. " +
                "Always respond with valid JSON only — no markdown, no code fences.";

        String userMessage = String.format(
                "Analyze this event data and determine if it risks selling out soon:\n\n" +
                "- Likes: %d\n" +
                "- Reservations: %d\n" +
                "- Remaining spots: %d\n\n" +
                "Respond ONLY with this JSON (no extra text):\n" +
                "{\"result\": \"RISQUE_ELEVE\" or \"RISQUE_FAIBLE\", \"reason\": \"short justification (max 100 chars)\"}",
                request.getLikes(),
                request.getReservations(),
                request.getPlacesRestantes()
        );

        String aiResponse = geminiService.chat(systemPrompt, userMessage);
        return parseAIResponse(aiResponse);
    }

    private EventPredictionResponse predictWithFallbackLogic(EventPredictionRequest request) {
        int totalPlaces = request.getReservations() + request.getPlacesRestantes();
        double occupancyRate = totalPlaces > 0 ? (double) request.getReservations() / totalPlaces : 0;

        if (request.getPlacesRestantes() <= 5) {
            return new EventPredictionResponse("RISQUE_ELEVE",
                    "Only " + request.getPlacesRestantes() + " spots remaining!");
        } else if (occupancyRate >= 0.8) {
            return new EventPredictionResponse("RISQUE_ELEVE",
                    "Over 80% of spots already reserved");
        } else if (occupancyRate >= 0.6) {
            return new EventPredictionResponse("RISQUE_ELEVE",
                    "Event is filling up quickly");
        } else if (request.getPlacesRestantes() <= 10) {
            return new EventPredictionResponse("RISQUE_ELEVE",
                    "Less than 10 spots available");
        } else {
            return new EventPredictionResponse("RISQUE_FAIBLE",
                    request.getPlacesRestantes() + " spots still available");
        }
    }

    private EventPredictionResponse parseAIResponse(String aiResponse) {
        try {
            String clean = aiResponse
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            String result = extractJsonValue(clean, "result");
            String reason = extractJsonValue(clean, "reason");

            if (!"RISQUE_ELEVE".equals(result) && !"RISQUE_FAIBLE".equals(result)) {
                result = "RISQUE_FAIBLE";
            }

            return new EventPredictionResponse(result, reason);
        } catch (Exception e) {
            return new EventPredictionResponse("RISQUE_FAIBLE", "Unable to parse AI response");
        }
    }

    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int startIndex = json.indexOf(searchKey);
        if (startIndex == -1) return "";
        int colonIndex = json.indexOf(":", startIndex);
        int valueStart = json.indexOf("\"", colonIndex) + 1;
        int valueEnd = json.indexOf("\"", valueStart);
        if (valueStart <= 0 || valueEnd < 0) return "";
        return json.substring(valueStart, valueEnd);
    }
}
