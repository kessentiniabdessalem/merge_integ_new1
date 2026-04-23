package pi.integrated.certificate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Certificate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "user_name")
    private String userName;
    
    @Column(name = "user_email")
    private String userEmail;
    
    @Column(name = "course_id")
    private Long courseId;
    
    @Column(name = "course_title")
    private String courseTitle;
    
    @Column(name = "certificate_number")
    private String certificateNumber;
    
    @Column(name = "issue_date")
    private LocalDateTime issueDate;
    
    @Column(name = "completion_date")
    private LocalDateTime completionDate;
    
    @Column(name = "grade")
    private String grade;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "pdf_path")
    private String pdfPath;
    
    @Column(name = "verification_code")
    private String verificationCode;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (issueDate == null) {
            issueDate = LocalDateTime.now();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        if (certificateNumber == null) {
            certificateNumber = generateCertificateNumber();
        }
        if (verificationCode == null) {
            verificationCode = generateVerificationCode();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private String generateCertificateNumber() {
        return "CERT-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 10000);
    }
    
    private String generateVerificationCode() {
        return "VER-" + System.currentTimeMillis();
    }
}
