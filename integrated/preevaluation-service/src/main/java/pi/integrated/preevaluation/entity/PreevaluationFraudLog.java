package pi.integrated.preevaluation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "preevaluation_fraud_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreevaluationFraudLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false, length = 255)
    private String userEmail;

    @Column(nullable = false, length = 64)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
