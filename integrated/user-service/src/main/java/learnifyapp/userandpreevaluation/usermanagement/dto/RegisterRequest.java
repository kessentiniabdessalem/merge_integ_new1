package learnifyapp.userandpreevaluation.usermanagement.dto;

import lombok.Data;

@Data
public class RegisterRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String personalEmail;

    // ✅ device info (pour trust au signup)
    private String deviceId;
    private String userAgent;
    private String platform;
    private String language;
    private String timezone;
}