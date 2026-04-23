package pi.integrated.jobservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "meetings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;

    // No JPA User entity — store evaluator as plain Long + name
    private Long assignedToId;
    private String assignedToName;

    private LocalDateTime meetingDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String meetingLink;
}
