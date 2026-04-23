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
public class NextMeetingDTO {
    private Long meetingId;
    private LocalDateTime meetingDate;
    private String meetingLink;
    private String jobTitle;
    private String otherPartyName;
}
