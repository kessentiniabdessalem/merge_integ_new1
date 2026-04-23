package pi.integrated.quiz.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttempt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
    
    @Column(name = "quiz_id", insertable = false, updatable = false)
    private Long quizId;
    
    @Column(nullable = false)
    private Long studentId;
    
    private String studentName;
    
    private Float score;
    
    private Integer totalPoints;
    
    private Boolean passed;
    
    @Column(nullable = false)
    private LocalDateTime startedAt;
    
    private LocalDateTime completedAt;
    
    private Integer timeSpentMinutes;
    
    @Column(columnDefinition = "TEXT")
    private String answers;
    
    @PrePersist
    protected void onCreate() {
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
    }
}
