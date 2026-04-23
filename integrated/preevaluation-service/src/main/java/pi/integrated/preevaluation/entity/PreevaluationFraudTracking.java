package pi.integrated.preevaluation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "preevaluation_fraud_tracking",
        uniqueConstraints = @UniqueConstraint(columnNames = "user_email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreevaluationFraudTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false, unique = true, length = 255)
    private String userEmail;

    @Column(name = "first_strike_consumed", nullable = false)
    private boolean firstStrikeConsumed;

    @Column(name = "terminated_for_cheating", nullable = false)
    private boolean terminatedForCheating;
}
