package pi.integrated.preevaluation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "preevaluation_answer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreevaluationAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false, length = 255)
    private String userEmail;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private Option selectedOption;

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect;
}
