package pi.integrated.ai.dto;

import java.util.List;

public class FeedbackSuggestionDTO {
    private List<String> suggestions;
    private String tone;
    private String focusArea;
    
    // Constructors
    public FeedbackSuggestionDTO() {}
    
    public FeedbackSuggestionDTO(List<String> suggestions, String tone, String focusArea) {
        this.suggestions = suggestions;
        this.tone = tone;
        this.focusArea = focusArea;
    }
    
    // Getters and Setters
    public List<String> getSuggestions() {
        return suggestions;
    }
    
    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }
    
    public String getTone() {
        return tone;
    }
    
    public void setTone(String tone) {
        this.tone = tone;
    }
    
    public String getFocusArea() {
        return focusArea;
    }
    
    public void setFocusArea(String focusArea) {
        this.focusArea = focusArea;
    }
}