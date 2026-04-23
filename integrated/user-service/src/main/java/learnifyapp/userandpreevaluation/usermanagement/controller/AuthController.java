package learnifyapp.userandpreevaluation.usermanagement.controller;

import jakarta.servlet.http.HttpServletRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.ForgotPasswordRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.LoginRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.LoginResponse;
import learnifyapp.userandpreevaluation.usermanagement.dto.RegisterRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.ResetPasswordRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.UnblockVerifyRequest;
import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.exception.AccountLockedException;
import learnifyapp.userandpreevaluation.usermanagement.exception.DeviceConfirmationRequiredException;
import learnifyapp.userandpreevaluation.usermanagement.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // ================= REGISTER =================
    @PostMapping("/register/student")
    public User registerStudent(@RequestBody RegisterRequest request) {
        return userService.registerStudent(request);
    }

    @PostMapping("/register/candidate")
    public User registerCandidate(@RequestBody RegisterRequest request) {
        return userService.registerCandidate(request);
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {

        // ✅ IP (X-Forwarded-For si proxy plus tard)
        String ip = httpRequest.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = httpRequest.getRemoteAddr();
        } else {
            ip = ip.split(",")[0].trim();
        }

        // ✅ IMPORTANT :
        // on préfère le userAgent envoyé par Angular (navigator.userAgent)
        // sinon fallback sur header
        String userAgent = (request.getUserAgent() != null && !request.getUserAgent().isBlank())
                ? request.getUserAgent()
                : httpRequest.getHeader("User-Agent");

        try {
            // ✅ On passe deviceId + infos device au login
            LoginResponse res = userService.login(
                    request.getEmail(),
                    request.getPassword(),
                    request.getRole(),
                    userAgent,
                    ip,
                    request.getDeviceId(),
                    request.getPlatform(),
                    request.getLanguage(),
                    request.getTimezone()
            );

            return ResponseEntity.ok(res);

        } catch (DeviceConfirmationRequiredException ex) {
            // ✅ PENDING => on renvoie token au frontend (pour /auth/device-pending?token=...)
            return ResponseEntity.status(403).body(Map.of(
                    "pending", true,
                    "token", ex.getToken()
            ));
        } catch (AccountLockedException ex) {
            return ResponseEntity.status(423).body(Map.of(
                    "code", "ACCOUNT_LOCKED",
                    "message", ex.getMessage(),
                    "lockedUntil", ex.getLockedUntil() != null ? ex.getLockedUntil().toString() : ""
            ));
        }
    }

    // ================= FORGOT PASSWORD (send PIN) =================
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("PIN sent to email");
    }

    // ================= RESET PASSWORD (verify PIN + update password) =================
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPasswordWithPin(
                request.getEmail(),
                request.getPin(),
                request.getNewPassword(),
                request.getConfirmNewPassword()
        );
        return ResponseEntity.ok("Password updated");
    }

    // ================= UNBLOCK ACCOUNT (après 3 tentatives échouées) =================
    @PostMapping("/unblock-request")
    public ResponseEntity<String> unblockRequest(@RequestBody ForgotPasswordRequest request) {
        userService.requestUnblockPin(request.getEmail());
        return ResponseEntity.ok("PIN sent to email");
    }

    @PostMapping("/unblock-verify")
    public ResponseEntity<String> unblockVerify(@RequestBody UnblockVerifyRequest request) {
        userService.verifyUnblockPin(request.getEmail(), request.getPin());
        return ResponseEntity.ok("Account unblocked");
    }
}