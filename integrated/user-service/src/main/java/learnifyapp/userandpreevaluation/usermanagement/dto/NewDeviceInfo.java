package learnifyapp.userandpreevaluation.usermanagement.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class NewDeviceInfo {
    private String deviceId;
    private String userAgent;
    private String platform;
    private String language;
    private String timezone;
    private String ip;
}