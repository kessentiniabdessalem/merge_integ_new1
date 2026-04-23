package pi.integrated.jobservice.dto;

import lombok.Data;
import pi.integrated.jobservice.model.ApplicationStatus;

@Data
public class UpdateApplicationRequest {
    private ApplicationStatus status;
}
