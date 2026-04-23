package pi.integrated.course.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonRequest {
    private String title;
    private String description;
    private Integer orderIndex;
    private Integer durationMinutes;
    private String videoUrl;
}
