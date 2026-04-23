package pi.integrated.preevaluation.entity;

import jakarta.persistence.*;
import lombok.*;
import pi.integrated.preevaluation.EnglishLevel;
import pi.integrated.preevaluation.QuestionCategory;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "preeval_questions", uniqueConstraints = @UniqueConstraint(columnNames = "source_hash"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 4000)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private EnglishLevel level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuestionCategory category;

    @Column(name = "source_hash", nullable = false, length = 64, unique = true)
    private String sourceHash;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<Option> options = new ArrayList<>();
}
