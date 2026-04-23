package pi.integrated.quiz.exception;

import java.util.List;

public class InappropriateContentException extends RuntimeException {
    
    private final List<String> detectedWords;
    
    public InappropriateContentException(String message, List<String> detectedWords) {
        super(message);
        this.detectedWords = detectedWords;
    }
    
    public InappropriateContentException(String message) {
        super(message);
        this.detectedWords = List.of();
    }
    
    public List<String> getDetectedWords() {
        return detectedWords;
    }
}