package pi.integrated.jobservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ratings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // No JPA User entity — store as plain Long + denormalized names
    private Long teacherId;
    private String teacherName;

    private Long studentId;
    private String studentName;

    private Integer note;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    private LocalDateTime createdAt;
}
