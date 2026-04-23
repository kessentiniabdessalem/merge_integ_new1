package pi.integrated.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pi.integrated.ai.dto.EventRecommendationRequest;
import pi.integrated.ai.dto.EventRecommendedEvent;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventRecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(EventRecommendationService.class);

    @Autowired
    private GeminiService geminiService;

    public List<EventRecommendedEvent> recommendEvents(EventRecommendationRequest request) {
        List<EventRecommendedEvent> availableEvents = request.getAvailableEvents();
        if (availableEvents == null || availableEvents.isEmpty()) {
            return new ArrayList<>();
        }

        try {
            return recommendWithGemini(request, availableEvents);
        } catch (Exception e) {
            logger.warn("Gemini AI failed for recommendation, using fallback: {}", e.getMessage());
            return recommendWithFallbackLogic(request, availableEvents);
        }
    }

    private List<EventRecommendedEvent> recommendWithGemini(
            EventRecommendationRequest request,
            List<EventRecommendedEvent> availableEvents) {

        String categoriesLiked = String.join(", ", request.getCategoriesLiked());
        String eventsText = buildEventsText(availableEvents);

        String systemPrompt = "You are an AI assistant that recommends events to users. " +
                "Respond ONLY with a comma-separated list of numeric IDs — no other text.";

        String userMessage = String.format(
                "The user likes these categories: %s\n\n" +
                "Available events:\n%s\n\n" +
                "Recommend the best 5 events for this user. " +
                "Reply ONLY with comma-separated IDs (example: 1,3,5,7,9). No extra text.",
                categoriesLiked,
                eventsText
        );

        String aiResponse = geminiService.chat(systemPrompt, userMessage);
        List<Long> recommendedIds = parseRecommendedIds(aiResponse);

        return availableEvents.stream()
                .filter(event -> recommendedIds.contains(event.getId()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<EventRecommendedEvent> recommendWithFallbackLogic(
            EventRecommendationRequest request,
            List<EventRecommendedEvent> availableEvents) {

        List<String> likedCategories = request.getCategoriesLiked() != null
                ? request.getCategoriesLiked().stream()
                        .map(String::toUpperCase)
                        .collect(Collectors.toList())
                : new ArrayList<>();

        List<EventRecommendedEvent> recommendations = availableEvents.stream()
                .filter(event -> likedCategories.isEmpty() ||
                        likedCategories.contains(event.getCategory().toUpperCase()))
                .limit(5)
                .collect(Collectors.toList());

        if (recommendations.size() < 5) {
            List<EventRecommendedEvent> extra = availableEvents.stream()
                    .filter(event -> !likedCategories.contains(event.getCategory().toUpperCase()))
                    .limit(5 - recommendations.size())
                    .collect(Collectors.toList());
            recommendations.addAll(extra);
        }

        return recommendations;
    }

    private String buildEventsText(List<EventRecommendedEvent> events) {
        StringBuilder sb = new StringBuilder();
        for (EventRecommendedEvent event : events) {
            sb.append(String.format(
                    "ID: %d, Name: %s, Category: %s, Date: %s, Available seats: %d\n",
                    event.getId(),
                    event.getName(),
                    event.getCategory(),
                    event.getDate(),
                    event.getAvailableSeats()
            ));
        }
        return sb.toString();
    }

    private List<Long> parseRecommendedIds(String aiResponse) {
        List<Long> ids = new ArrayList<>();
        try {
            String clean = aiResponse.replaceAll("[^0-9,]", "");
            for (String part : clean.split(",")) {
                if (!part.trim().isEmpty()) {
                    ids.add(Long.parseLong(part.trim()));
                }
            }
        } catch (Exception e) {
            // ignore parse errors
        }
        return ids;
    }
}
