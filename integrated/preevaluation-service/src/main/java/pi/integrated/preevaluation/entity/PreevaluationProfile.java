package pi.integrated.preevaluation.entity;

import jakarta.persistence.*;
import lombok.*;
import pi.integrated.preevaluation.EnglishUsageFrequency;
import pi.integrated.preevaluation.LearningGoal;

@Entity
@Table(name = "preevaluation_profile",
        uniqueConstraints = @UniqueConstraint(columnNames = "user_email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreevaluationProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false, unique = true, length = 255)
    private String userEmail;

    @Column(name = "studied_before", nullable = false)
    private boolean studiedBefore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private EnglishUsageFrequency frequency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private LearningGoal goal;
}
