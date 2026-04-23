package pi.integrated.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    
    private Long id;
    
    @NotNull(message = "User ID is required")
    @JsonProperty("userId")
    private Long userId;
    
    @JsonProperty("userName")
    private String userName;
    
    @NotNull(message = "Course ID is required")
    @JsonProperty("courseId")
    private Long courseId;
    
    @JsonProperty("courseTitle")
    private String courseTitle;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
    
    private String currency;
    
    @JsonProperty("paymentMethod")
    private String paymentMethod;
    
    @NotNull(message = "Payment status is required")
    @JsonProperty("paymentStatus")
    private String paymentStatus;
    
    @JsonProperty("transactionId")
    private String transactionId;
    
    @JsonProperty("paymentDate")
    private LocalDateTime paymentDate;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}
