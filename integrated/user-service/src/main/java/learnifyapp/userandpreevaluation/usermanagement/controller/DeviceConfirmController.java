package learnifyapp.userandpreevaluation.usermanagement.controller;

import learnifyapp.userandpreevaluation.security.JwtUtil;
import learnifyapp.userandpreevaluation.usermanagement.dto.ApiErrorResponse;
import learnifyapp.userandpreevaluation.usermanagement.enums.DeviceAttemptStatus;
import learnifyapp.userandpreevaluation.usermanagement.repository.DeviceLoginAttemptRepository;
import learnifyapp.userandpreevaluation.usermanagement.service.DeviceService;
import learnifyapp.userandpreevaluation.usermanagement.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/device")
public class DeviceConfirmController {

    private final DeviceService deviceService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final DeviceLoginAttemptRepository deviceLoginAttemptRepository;

    public DeviceConfirmController(DeviceService deviceService,
                                   UserService userService,
                                   JwtUtil jwtUtil,
                                   DeviceLoginAttemptRepository deviceLoginAttemptRepository) {
        this.deviceService = deviceService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.deviceLoginAttemptRepository = deviceLoginAttemptRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<?> status(@RequestParam(required = false) String token) {
        String t = token != null ? token.trim() : "";
        if (t.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("status", "INVALID"));
        }
        var attemptOpt = deviceLoginAttemptRepository.findByToken(t);
        if (attemptOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("status", "INVALID"));
        }
        var attempt = attemptOpt.get();
        return ResponseEntity.ok(Map.of("status", attempt.getStatus().name()));
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirm(@RequestParam(required = false) String token) {
        String t = token != null ? token.trim() : "";
        if (t.isEmpty()) {
            return ResponseEntity.status(400).body(new ApiErrorResponse("INVALID_TOKEN", "Missing or invalid token"));
        }
        String res = deviceService.confirmAttemptAndTrustDevice(t);

        if ("INVALID".equals(res)) {
            return ResponseEntity.status(404).body(new ApiErrorResponse("INVALID_TOKEN", "Confirmation failed or expired"));
        }
        if ("EXPIRED".equals(res)) {
            return ResponseEntity.status(410)
                    .body(new ApiErrorResponse("TOKEN_EXPIRED", "Confirmation link expired"));
        }
        if ("ALREADY_USED".equals(res)) {
            return ResponseEntity.status(409)
                    .body(new ApiErrorResponse("ALREADY_USED", "Token already used"));
        }

        var attempt = deviceLoginAttemptRepository.findByToken(t).orElseThrow();
        var user = attempt.getUser();
        String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        userService.createSessionFor(user.getEmail(), attempt.getUserAgent(), attempt.getIp());

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "role", user.getRole().name(),
                "email", user.getEmail()
        ));
    }

    /**
     * GET /api/auth/device/session?token=XXX
     * Retourne JWT + user quand le statut est déjà CONFIRMED (pour device-pending après polling).
     */
    @GetMapping("/session")
    public ResponseEntity<?> session(@RequestParam(required = false) String token) {
        String t = token != null ? token.trim() : "";
        if (t.isEmpty()) {
            return ResponseEntity.status(400).body(new ApiErrorResponse("INVALID_TOKEN", "Missing token"));
        }
        var attemptOpt = deviceLoginAttemptRepository.findByToken(t);
        if (attemptOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiErrorResponse("INVALID_TOKEN", "Invalid or expired token"));
        }
        var attempt = attemptOpt.get();
        if (attempt.getStatus() != DeviceAttemptStatus.CONFIRMED) {
            return ResponseEntity.status(409).body(Map.of("status", attempt.getStatus().name()));
        }
        var user = attempt.getUser();
        String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        userService.createSessionFor(user.getEmail(), attempt.getUserAgent(), attempt.getIp());

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "role", user.getRole().name(),
                "email", user.getEmail()
        ));
    }

    @PostMapping("/reject")
    public ResponseEntity<?> reject(@RequestParam(required = false) String token) {
        String t = token != null ? token.trim() : "";
        if (t.isEmpty()) {
            return ResponseEntity.status(400).body(new ApiErrorResponse("INVALID_TOKEN", "Missing token"));
        }
        String res = deviceService.rejectAttempt(t);

        if ("INVALID".equals(res)) {
            return ResponseEntity.status(404).body(new ApiErrorResponse("INVALID_TOKEN", "Invalid token"));
        }
        if ("ALREADY_USED".equals(res)) {
            return ResponseEntity.status(409)
                    .body(new ApiErrorResponse("ALREADY_USED", "Token already used"));
        }

        return ResponseEntity.ok(Map.of("status", "REJECTED"));
    }
}