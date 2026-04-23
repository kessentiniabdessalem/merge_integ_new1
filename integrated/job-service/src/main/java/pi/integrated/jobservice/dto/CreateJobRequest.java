package pi.integrated.jobservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateJobRequest {
    private String title;
    private String description;
    private String location;
    private String subject;
    private Double salaryMin;
    private Double salaryMax;
    private LocalDateTime expiresAt;
    // Optional: schedule publication instead of immediate
    private LocalDateTime scheduledPublicationAt;
}
