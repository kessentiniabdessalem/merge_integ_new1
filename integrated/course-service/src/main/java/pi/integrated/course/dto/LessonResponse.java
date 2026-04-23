package pi.integrated.course.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonResponse {
    private Long id;
    private Long moduleId;
    private Long courseId;
    private String title;
    private String description;
    private Integer orderIndex;
    private Integer durationMinutes;
    private String videoUrl;
}
