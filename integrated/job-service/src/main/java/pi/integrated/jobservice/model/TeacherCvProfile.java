package pi.integrated.jobservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_cv_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherCvProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    private String cvPath;

    private LocalDateTime uploadedAt;
}
