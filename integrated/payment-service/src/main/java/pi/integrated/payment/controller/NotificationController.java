package pi.integrated.payment.controller;

import pi.integrated.payment.dto.ApiResponse;
import pi.integrated.payment.dto.EmailRequest;
import pi.integrated.payment.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "APIs for sending notifications")
public class NotificationController {
    
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);
    private final EmailService emailService;
    
    @PostMapping("/email")
    @Operation(summary = "Send email notification")
    public ResponseEntity<ApiResponse<String>> sendEmail(@Valid @RequestBody EmailRequest request) {
        try {
            log.info("Sending email to: {}, subject: {}", request.getTo(), request.getSubject());
            
            emailService.sendPaymentConfirmation(
                request.getTo(),
                request.getSubject(),
                request.getBody()
            );
            
            log.info("Email sent successfully to: {}", request.getTo());
            return ResponseEntity.ok(
                ApiResponse.success("Email sent successfully", "Email delivered to " + request.getTo())
            );
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", request.getTo(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to send email: " + e.getMessage()));
        }
    }
    
    @GetMapping("/test")
    @Operation(summary = "Test notification service")
    public ResponseEntity<ApiResponse<String>> testNotification() {
        return ResponseEntity.ok(
            ApiResponse.success("Notification service is running", "Ready to send emails")
        );
    }
}
