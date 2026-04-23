package pi.integrated.jobservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_publication_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPublicationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job;

    private LocalDateTime scheduledAt;

    private boolean published;
}
