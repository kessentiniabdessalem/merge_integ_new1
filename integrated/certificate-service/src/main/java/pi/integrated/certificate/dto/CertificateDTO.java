package pi.integrated.certificate.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificateDTO {
    
    private Long id;
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    private String userName;
    
    private String userEmail;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    private String courseTitle;
    
    private String certificateNumber;
    
    private LocalDateTime issueDate;
    
    private LocalDateTime completionDate;
    
    private String grade;
    
    @NotNull(message = "Status is required")
    private String status;
    
    private String pdfPath;
    
    private String verificationCode;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
