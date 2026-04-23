package pi.integrated.jobservice.dto;

import lombok.Data;

@Data
public class ApplicationRequest {
    private Long jobId;
    private String motivation;
    // cv and certificat are sent as multipart files, not in this DTO
}
