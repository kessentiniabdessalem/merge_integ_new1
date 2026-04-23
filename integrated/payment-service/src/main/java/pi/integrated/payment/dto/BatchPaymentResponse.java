package pi.integrated.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchPaymentResponse {
    private boolean success;
    private String message;
    private int totalPayments;
    private Double totalAmount;
    private List<PaymentDTO> payments;
    
    public static BatchPaymentResponse success(List<PaymentDTO> payments, Double totalAmount) {
        return new BatchPaymentResponse(
            true,
            "Batch payment processed successfully",
            payments.size(),
            totalAmount,
            payments
        );
    }
    
    public static BatchPaymentResponse error(String message) {
        return new BatchPaymentResponse(
            false,
            message,
            0,
            0.0,
            null
        );
    }
}
