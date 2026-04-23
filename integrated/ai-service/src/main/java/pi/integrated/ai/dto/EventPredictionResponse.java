package pi.integrated.ai.dto;

public class EventPredictionResponse {
    private String result;  // "RISQUE_ELEVE" or "RISQUE_FAIBLE"
    private String reason;

    public EventPredictionResponse() {}

    public EventPredictionResponse(String result, String reason) {
        this.result = result;
        this.reason = reason;
    }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
