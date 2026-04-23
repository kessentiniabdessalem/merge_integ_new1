package pi.integrated.course.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleResponse {
    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private Integer orderIndex;
    private Integer durationMinutes;
    private List<LessonResponse> lessons;
}
