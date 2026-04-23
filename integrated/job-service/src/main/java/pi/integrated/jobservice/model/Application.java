package pi.integrated.jobservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job;

    // No JPA User entity — store as plain Long + denormalized name
    private Long teacherId;
    private String teacherName;

    @Column(columnDefinition = "TEXT")
    private String motivation;

    private String cvPath;
    private String certificatPath;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    private LocalDateTime appliedAt;

    private Double matchScore;
}
