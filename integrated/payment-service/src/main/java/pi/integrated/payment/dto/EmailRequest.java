package pi.integrated.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {
    
    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    @JsonProperty("to")
    private String to;
    
    @NotBlank(message = "Subject is required")
    @JsonProperty("subject")
    private String subject;
    
    @NotBlank(message = "Email body is required")
    @JsonProperty("body")
    private String body;
    
    @JsonProperty("type")
    private String type;
}
