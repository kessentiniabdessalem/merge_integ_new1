package learnifyapp.userandpreevaluation.usermanagement.controller;

import jakarta.servlet.http.HttpServletRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.QrApproveRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.QrExchangeRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.QrStartRequest;
import learnifyapp.userandpreevaluation.usermanagement.service.QrLoginService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth/qr")
public class QrLoginController {

    private final QrLoginService qrLoginService;
    private final ConcurrentHashMap<String, Long> lastStartByIp = new ConcurrentHashMap<>();

    public QrLoginController(QrLoginService qrLoginService) {
        this.qrLoginService = qrLoginService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> start(@RequestBody(required = false) QrStartRequest request,
                                   HttpServletRequest httpRequest) {
        String ip = clientIp(httpRequest);
        long now = System.currentTimeMillis();
        long minIntervalMs = 5_000;

        Long last = lastStartByIp.get(ip);
        if (last != null && (now - last) < minIntervalMs) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Too many QR sessions started. Please wait a few seconds."));
        }
        lastStartByIp.put(ip, now);

        String email = (request != null) ? request.getEmail() : null;

        String space = (request != null) ? request.getSpace() : null;
        if (space == null || space.isBlank()) space = "student"; // ✅ default
        space = space.trim().toLowerCase();

        return ResponseEntity.ok(qrLoginService.startSession(email, space));
    }

    @GetMapping("/status")
    public ResponseEntity<?> status(@RequestParam String sessionId) {
        return ResponseEntity.ok(qrLoginService.getStatus(sessionId));
    }

    @PostMapping("/approve")
    public ResponseEntity<?> approve(@RequestBody QrApproveRequest request,
                                     HttpServletRequest httpRequest) {
        if (request == null || request.getToken() == null || request.getToken().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing token"));
        }

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing or invalid Authorization header"));
        }

        String jwt = authHeader.substring(7);
        qrLoginService.approve(request.getToken().trim(), jwt);

        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/exchange")
    public ResponseEntity<?> exchange(@RequestBody QrExchangeRequest request,
                                      HttpServletRequest httpRequest) {
        if (request == null ||
                request.getSessionId() == null || request.getSessionId().isBlank() ||
                request.getExchangeCode() == null || request.getExchangeCode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing sessionId or exchangeCode"));
        }

        return ResponseEntity.ok(
                qrLoginService.exchange(
                        request.getSessionId().trim(),
                        request.getExchangeCode().trim(),
                        httpRequest
                )
        );
    }

    private String clientIp(HttpServletRequest httpRequest) {
        String ip = httpRequest.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = httpRequest.getRemoteAddr();
        else ip = ip.split(",")[0].trim();
        return ip;
    }
}