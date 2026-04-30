package pi.integrated.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendedCourseResponse {
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
    /** Human-readable explanation shown to the student */
    private String reason;
}
