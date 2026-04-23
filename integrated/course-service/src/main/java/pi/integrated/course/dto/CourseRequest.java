package pi.integrated.course.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequest {
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
}
