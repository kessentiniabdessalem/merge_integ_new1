package learnifyapp.userandpreevaluation.usermanagement.dto;

import learnifyapp.userandpreevaluation.usermanagement.entity.UserSession;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionDto {
    private String sessionId;
    private String browser;
    private String os;
    private String ip;
    private LocalDateTime createdAt;
    private LocalDateTime lastSeenAt;
    private boolean revoked;

    public static UserSessionDto from(UserSession s) {
        return new UserSessionDto(
                s.getSessionId(),
                s.getBrowser(),
                s.getOs(),
                s.getIp(),
                s.getCreatedAt(),
                s.getLastSeenAt(),
                s.isRevoked()
        );
    }
}