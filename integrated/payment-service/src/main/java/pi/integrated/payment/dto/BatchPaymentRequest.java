package pi.integrated.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchPaymentRequest {
    
    @JsonProperty("user_id")
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @JsonProperty("user_name")
    private String userName;
    
    @JsonProperty("user_email")
    private String userEmail;
    
    @NotEmpty(message = "Courses list cannot be empty")
    @Valid
    private List<CoursePaymentItem> courses;
    
    @JsonProperty("total_amount")
    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private Double totalAmount;
    
    @JsonProperty("payment_method")
    @NotNull(message = "Payment method is required")
    private String paymentMethod;
    
    @NotNull(message = "Currency is required")
    private String currency;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoursePaymentItem {
        
        @JsonProperty("course_id")
        @NotNull(message = "Course ID is required")
        private Long courseId;
        
        @JsonProperty("course_title")
        private String courseTitle;
        
        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be positive")
        private Double amount;
    }
}
