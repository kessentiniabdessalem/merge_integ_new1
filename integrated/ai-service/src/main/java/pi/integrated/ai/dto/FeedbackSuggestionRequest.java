package pi.integrated.ai.dto;

public class FeedbackSuggestionRequest {
    private Long quizId;
    private String quizTitle;
    private Long attemptId;
    private Integer score;
    private Integer totalPoints;
    private String difficulty;
    private String topic;
    
    // Constructors
    public FeedbackSuggestionRequest() {}
    
    public FeedbackSuggestionRequest(Long quizId, String quizTitle, Long attemptId, 
                                   Integer score, Integer totalPoints, String difficulty, String topic) {
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.attemptId = attemptId;
        this.score = score;
        this.totalPoints = totalPoints;
        this.difficulty = difficulty;
        this.topic = topic;
    }
    
    // Getters and Setters
    public Long getQuizId() {
        return quizId;
    }
    
    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
    
    public String getQuizTitle() {
        return quizTitle;
    }
    
    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }
    
    public Long getAttemptId() {
        return attemptId;
    }
    
    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }
    
    public Integer getScore() {
        return score;
    }
    
    public void setScore(Integer score) {
        this.score = score;
    }
    
    public Integer getTotalPoints() {
        return totalPoints;
    }
    
    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }
    
    public String getDifficulty() {
        return difficulty;
    }
    
    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
    
    public String getTopic() {
        return topic;
    }
    
    public void setTopic(String topic) {
        this.topic = topic;
    }
}