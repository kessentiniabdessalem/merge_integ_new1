package pi.integrated.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pi.integrated.jobservice.model.ApplicationStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDTO {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long teacherId;
    private String teacherName;
    private String motivation;
    private String cvPath;
    private String certificatPath;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private Double matchScore;
}
