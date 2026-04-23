package learnifyapp.userandpreevaluation.usermanagement.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    private String email;
    private String password;
    private String role;   //
    private String deviceId;
    private String userAgent;
    private String platform;
    private String language;
    private String timezone;// 🔥 AJOUTER CECI


}
