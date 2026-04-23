package pi.integrated.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingDTO {
    private Long id;
    private Long applicationId;
    private Long teacherId;
    private String teacherName;
    private String jobTitle;
    private Long assignedToId;
    private String assignedToName;
    private LocalDateTime meetingDate;
    private String notes;
    private String meetingLink;
}
