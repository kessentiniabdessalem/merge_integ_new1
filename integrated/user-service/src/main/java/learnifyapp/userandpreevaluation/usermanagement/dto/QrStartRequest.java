package learnifyapp.userandpreevaluation.usermanagement.dto;

import lombok.Data;

@Data
public class QrStartRequest {
    private String email;
    private String space; // "student" | "admin" | "tutor"
}