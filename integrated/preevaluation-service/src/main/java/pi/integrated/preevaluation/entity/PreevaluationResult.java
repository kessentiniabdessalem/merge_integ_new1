package pi.integrated.preevaluation.entity;

import jakarta.persistence.*;
import lombok.*;
import pi.integrated.preevaluation.EnglishLevel;

import java.time.Instant;

@Entity
@Table(name = "preevaluation_result",
        uniqueConstraints = @UniqueConstraint(columnNames = "user_email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreevaluationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false, unique = true, length = 255)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "final_level", nullable = false, length = 8)
    private EnglishLevel finalLevel;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;
}
