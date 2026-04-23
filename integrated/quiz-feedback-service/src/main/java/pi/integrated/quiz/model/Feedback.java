package pi.integrated.quiz.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long quizId;
    
    private Long courseId;
    
    @Column(nullable = false)
    private Long studentId;
    
    private String studentName;
    
    @Column(nullable = false)
    private Integer rating;
    
    @Column(length = 2000)
    private String comment;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackType type = FeedbackType.GENERAL;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
