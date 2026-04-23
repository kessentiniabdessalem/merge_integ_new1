package learnifyapp.userandpreevaluation.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QrStartResponse {
    private String sessionId;
    private String qrUrl;
    private String expiresAt;
}

