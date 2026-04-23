package pi.integrated.preevaluation.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "preevaluation.ai")
public class PreevaluationAiProperties {

    private Provider provider = Provider.GROQ;
    private String apiKey = "";
    private String baseUrl = "";
    private String model = "";

    public enum Provider {
        GROQ,
        OPENAI
    }
}
