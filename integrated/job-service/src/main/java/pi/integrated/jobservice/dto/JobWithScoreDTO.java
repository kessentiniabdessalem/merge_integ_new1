package pi.integrated.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pi.integrated.jobservice.model.JobStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobWithScoreDTO {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String subject;
    private Double salaryMin;
    private Double salaryMax;
    private JobStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Double matchScore;
    private boolean saved;
    private boolean applied;
}
