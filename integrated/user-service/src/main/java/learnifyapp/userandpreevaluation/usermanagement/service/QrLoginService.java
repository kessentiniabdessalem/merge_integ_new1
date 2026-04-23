package learnifyapp.userandpreevaluation.usermanagement.service;

import jakarta.servlet.http.HttpServletRequest;
import learnifyapp.userandpreevaluation.security.JwtUtil;
import learnifyapp.userandpreevaluation.usermanagement.dto.LoginResponse;
import learnifyapp.userandpreevaluation.usermanagement.dto.QrStartResponse;
import learnifyapp.userandpreevaluation.usermanagement.dto.QrStatusResponse;
import learnifyapp.userandpreevaluation.usermanagement.entity.QrLoginSession;
import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.enums.QrLoginStatus;
import learnifyapp.userandpreevaluation.usermanagement.repository.QrLoginSessionRepository;
import learnifyapp.userandpreevaluation.usermanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QrLoginService {

    private final QrLoginSessionRepository qrLoginSessionRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final UserSessionService userSessionService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final long ttlSeconds = 120;

    public QrStartResponse startSession(String email, String space) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusSeconds(ttlSeconds);

        String sessionId = UUID.randomUUID().toString();
        String token = randomToken();

        String tokenHash = hash(token);

        if (space == null || space.isBlank()) space = "student";
        space = space.trim().toLowerCase();

        QrLoginSession session = QrLoginSession.builder()
                .id(sessionId)
                .tokenHash(tokenHash)
                .status(QrLoginStatus.PENDING)
                .createdAt(now)
                .expiresAt(expiresAt)
                .space(space) // ✅ important
                .build();

        qrLoginSessionRepository.save(session);

        String base = frontendUrl != null ? frontendUrl.trim() : "http://localhost:4200";
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);

        // ✅ IMPORTANT: on met aussi role dans l’URL du téléphone
        String qrUrl = base + "/auth/qr-approve?token=" +
                URLEncoder.encode(token, StandardCharsets.UTF_8) +
                "&role=" + URLEncoder.encode(space, StandardCharsets.UTF_8);

        return new QrStartResponse(sessionId, qrUrl, expiresAt.toString());
    }

    public QrStatusResponse getStatus(String sessionId) {
        Optional<QrLoginSession> opt = qrLoginSessionRepository.findById(sessionId);
        if (opt.isEmpty()) return new QrStatusResponse("EXPIRED", null);

        QrLoginSession session = opt.get();
        updateIfExpired(session);

        if (session.getStatus() == QrLoginStatus.PENDING) {
            return new QrStatusResponse("PENDING", null);
        }

        if (session.getStatus() == QrLoginStatus.APPROVED) {
            if (!StringUtils.hasText(session.getExchangeCodeHash())) {
                String exchangeCode = randomToken();
                session.setExchangeCodeHash(hash(exchangeCode));
                qrLoginSessionRepository.save(session);
                return new QrStatusResponse("APPROVED", exchangeCode);
            }
            return new QrStatusResponse("EXPIRED", null);
        }

        return new QrStatusResponse("EXPIRED", null);
    }

    public void approve(String token, String authJwt) {
        String email = jwtUtil.extractEmail(authJwt);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String tokenHash = hash(token);

        QrLoginSession session = qrLoginSessionRepository.findAll().stream()
                .filter(s -> s.getTokenHash().equals(tokenHash))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid or expired QR token"));

        updateIfExpired(session);
        if (session.getStatus() != QrLoginStatus.PENDING) {
            throw new RuntimeException("Session is not pending");
        }

        // ✅ Check space ici (on a user + session.space)
        String expected = session.getSpace();
        if (expected == null || expected.isBlank()) expected = "student";
        expected = expected.trim().toLowerCase();

        String userRole = user.getRole().name().toLowerCase();
        if (!expected.equals(userRole)) {
            throw new RuntimeException("Access denied: wrong space for this account");
        }

        session.setStatus(QrLoginStatus.APPROVED);
        session.setApprovedUserId(user.getId());
        session.setApprovedAt(LocalDateTime.now());
        qrLoginSessionRepository.save(session);
    }

    public LoginResponse exchange(String sessionId, String exchangeCode, HttpServletRequest request) {
        QrLoginSession session = qrLoginSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Invalid session"));

        updateIfExpired(session);
        if (session.getStatus() != QrLoginStatus.APPROVED) {
            throw new RuntimeException("Session not approved or already used");
        }

        if (!StringUtils.hasText(exchangeCode) || !StringUtils.hasText(session.getExchangeCodeHash())) {
            throw new RuntimeException("Invalid exchange");
        }

        String providedHash = hash(exchangeCode);
        if (!providedHash.equals(session.getExchangeCodeHash())) {
            throw new RuntimeException("Invalid exchange code");
        }

        if (session.getApprovedUserId() == null) {
            throw new RuntimeException("No approved user for this session");
        }

        User user = userRepository.findById(session.getApprovedUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        session.setStatus(QrLoginStatus.USED);
        session.setUsedAt(LocalDateTime.now());
        qrLoginSessionRepository.save(session);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        else ip = ip.split(",")[0].trim();

        String userAgent = request.getHeader("User-Agent");
        userSessionService.createSession(user, userAgent, ip);

        return new LoginResponse(token, user.getRole().name(), user.getEmail());
    }

    private void updateIfExpired(QrLoginSession session) {
        if (session.getStatus() == QrLoginStatus.PENDING || session.getStatus() == QrLoginStatus.APPROVED) {
            if (session.getExpiresAt() != null && session.getExpiresAt().isBefore(LocalDateTime.now())) {
                session.setStatus(QrLoginStatus.EXPIRED);
                qrLoginSessionRepository.save(session);
            }
        }
    }

    private String randomToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashed) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Hash error", e);
        }
    }
}