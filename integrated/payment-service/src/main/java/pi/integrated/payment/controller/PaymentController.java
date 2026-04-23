package pi.integrated.payment.controller;

import pi.integrated.payment.dto.ApiResponse;
import pi.integrated.payment.dto.BatchPaymentRequest;
import pi.integrated.payment.dto.BatchPaymentResponse;
import pi.integrated.payment.dto.PaymentDTO;
import pi.integrated.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "APIs for managing payments")
public class PaymentController {
    
    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentService paymentService;
    
    @GetMapping
    @Operation(summary = "Get all payments")
    public ResponseEntity<ApiResponse<List<PaymentDTO>>> getAllPayments() {
        try {
            log.info("Fetching all payments...");
            List<PaymentDTO> payments = paymentService.getAllPayments();
            log.info("Successfully fetched {} payments", payments.size());
            return ResponseEntity.ok(ApiResponse.success(payments));
        } catch (Exception e) {
            log.error("Error fetching all payments", e);
            log.error("Error message: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch payments: " + e.getMessage()));
        }
    }
    
    @PostMapping
    @Operation(summary = "Create new payment")
    public ResponseEntity<ApiResponse<PaymentDTO>> createPayment(@Valid @RequestBody PaymentDTO paymentDTO) {
        PaymentDTO createdPayment = paymentService.createPayment(paymentDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment created successfully", createdPayment));
    }
    
    // IMPORTANT: Specific routes like /batch must come BEFORE generic routes like /{id}
    @PostMapping("/batch")
    @Operation(summary = "Process batch payment for multiple courses")
    public ResponseEntity<BatchPaymentResponse> processBatchPayment(
            @Valid @RequestBody BatchPaymentRequest request) {
        try {
            log.info("Received batch payment request for user: {}, courses: {}", 
                     request.getUserId(), request.getCourses().size());
            log.info("Request details: {}", request);
            
            List<PaymentDTO> payments = paymentService.processBatchPayment(request);
            BatchPaymentResponse response = BatchPaymentResponse.success(payments, request.getTotalAmount());
            
            log.info("Batch payment completed successfully. Created {} payments", payments.size());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error processing batch payment", e);
            log.error("Error message: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BatchPaymentResponse.error("Failed to process batch payment: " + e.getMessage()));
        }
    }
    
    @GetMapping("/total-revenue")
    @Operation(summary = "Get total revenue from paid payments")
    public ResponseEntity<ApiResponse<Double>> getTotalRevenue() {
        Double revenue = paymentService.getTotalRevenue();
        return ResponseEntity.ok(ApiResponse.success(revenue));
    }
    
    @GetMapping("/count")
    @Operation(summary = "Get total payment count")
    public ResponseEntity<ApiResponse<Long>> getPaymentCount() {
        Long count = paymentService.getPaymentCount();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
    
    // Generic /{id} routes must come AFTER specific routes like /batch, /total-revenue, /count
    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPaymentById(@PathVariable Long id) {
        PaymentDTO payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update payment")
    public ResponseEntity<ApiResponse<PaymentDTO>> updatePayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentDTO paymentDTO) {
        PaymentDTO updatedPayment = paymentService.updatePayment(id, paymentDTO);
        return ResponseEntity.ok(ApiResponse.success("Payment updated successfully", updatedPayment));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete payment")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.success("Payment deleted successfully", null));
    }
}
