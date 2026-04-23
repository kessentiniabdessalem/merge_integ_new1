package pi.integrated.ai.dto;

import java.util.List;

public class EventRecommendationRequest {
    private List<String> categoriesLiked;
    // Events passed from the frontend so ai-service doesn't need to call event-service
    private List<EventRecommendedEvent> availableEvents;

    public EventRecommendationRequest() {}

    public EventRecommendationRequest(List<String> categoriesLiked, List<EventRecommendedEvent> availableEvents) {
        this.categoriesLiked = categoriesLiked;
        this.availableEvents = availableEvents;
    }

    public List<String> getCategoriesLiked() { return categoriesLiked; }
    public void setCategoriesLiked(List<String> categoriesLiked) { this.categoriesLiked = categoriesLiked; }

    public List<EventRecommendedEvent> getAvailableEvents() { return availableEvents; }
    public void setAvailableEvents(List<EventRecommendedEvent> availableEvents) { this.availableEvents = availableEvents; }
}
