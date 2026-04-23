package pi.integrated.preevaluation.entity;

import jakarta.persistence.*;
import lombok.*;
import pi.integrated.preevaluation.EnglishLevel;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "preevaluation_level_selection")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreevaluationLevelSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false, length = 255)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private EnglishLevel level;

    @Column(nullable = false)
    private boolean submitted;

    @Column(nullable = false)
    private boolean passed;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "preevaluation_level_selection_q", joinColumns = @JoinColumn(name = "selection_id"))
    @Column(name = "question_id")
    @OrderColumn(name = "sort_idx")
    @Builder.Default
    private List<Long> questionIds = new ArrayList<>();
}
