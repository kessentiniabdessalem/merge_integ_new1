package pi.integrated.course.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String category;
    private String level;
    private String description;
    private Integer duration;
    private BigDecimal price;
    private String teacher;
    private String image;
    private String thumbnail;
    private Integer studentsCount;
    private LocalDateTime createdAt;
    private List<ModuleResponse> modules;
}
