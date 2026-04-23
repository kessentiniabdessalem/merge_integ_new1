package learnifyapp.userandpreevaluation.usermanagement.service;

import learnifyapp.userandpreevaluation.usermanagement.dto.NewDeviceInfo;
import learnifyapp.userandpreevaluation.usermanagement.entity.DeviceLoginAttempt;
import learnifyapp.userandpreevaluation.usermanagement.entity.KnownDevice;
import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.enums.DeviceAttemptStatus;
import learnifyapp.userandpreevaluation.usermanagement.repository.DeviceLoginAttemptRepository;
import learnifyapp.userandpreevaluation.usermanagement.repository.KnownDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceService {

    @Value("${app.frontend-url:http://localhost:4200}")
    private String appFrontendUrl;

    private final KnownDeviceRepository knownDeviceRepository;
    private final DeviceLoginAttemptRepository attemptRepository;
    private final EmailService emailService;

    // ✅ appelé par OAuth SIGNUP (nouveau compte) => trust direct
    public void trustDeviceOnSignup(User user, NewDeviceInfo info) {
        if (info == null || info.getDeviceId() == null || info.getDeviceId().isBlank()) return;

        boolean already = knownDeviceRepository.existsByUserIdAndDeviceId(user.getId(), info.getDeviceId());
        if (already) return;

        LocalDateTime now = LocalDateTime.now();
        KnownDevice kd = KnownDevice.builder()
                .user(user)
                .deviceId(info.getDeviceId())
                .userAgent(info.getUserAgent())
                .platform(info.getPlatform())
                .language(info.getLanguage())
                .timezone(info.getTimezone())
                .lastIp(info.getIp())
                .firstSeenAt(now)
                .lastSeenAt(now)
                .build();

        knownDeviceRepository.save(kd);
    }

    // ✅ retourne "KNOWN" ou "PENDING:<token>"
    public String checkDeviceOrCreateAttempt(User user, NewDeviceInfo info, String provider, String mode) {

        if (info == null || info.getDeviceId() == null || info.getDeviceId().isBlank()) {
            return "KNOWN"; // (idéalement rendre deviceId obligatoire)
        }

        LocalDateTime now = LocalDateTime.now();

        // ✅ 0) Si aucun device encore pour cet utilisateur => premier device = trusted
        boolean hasAnyDevice = knownDeviceRepository.existsByUserId(user.getId());
        if (!hasAnyDevice) {
            trustDeviceOnSignup(user, info);
            return "KNOWN";
        }

        // ✅ 1) Si device connu => update
        var existingOpt = knownDeviceRepository.findByUserIdAndDeviceId(user.getId(), info.getDeviceId());
        if (existingOpt.isPresent()) {
            KnownDevice kd = existingOpt.get();
            kd.setLastSeenAt(now);
            kd.setLastIp(info.getIp());
            if (info.getUserAgent() != null) kd.setUserAgent(info.getUserAgent());
            if (info.getPlatform() != null) kd.setPlatform(info.getPlatform());
            if (info.getLanguage() != null) kd.setLanguage(info.getLanguage());
            if (info.getTimezone() != null) kd.setTimezone(info.getTimezone());
            knownDeviceRepository.save(kd);
            return "KNOWN";
        }

        // ✅ 2) Device inconnu => attempt PENDING + email
        String token = UUID.randomUUID().toString();

        DeviceLoginAttempt a = DeviceLoginAttempt.builder()
                .user(user)
                .deviceId(info.getDeviceId())
                .userAgent(info.getUserAgent())
                .ip(info.getIp())
                .platform(info.getPlatform())
                .language(info.getLanguage())
                .timezone(info.getTimezone())
                .status(DeviceAttemptStatus.PENDING)
                .token(token)
                .createdAt(now)
                .expiresAt(now.plusMinutes(15))
                .provider(provider)
                .mode(mode)
                .build();

        attemptRepository.save(a);

        String base = frontendBaseUrl();
        String confirmUrl = base + "/auth/device-confirm?token=" + token;
        String rejectUrl = base + "/auth/device-reject?token=" + token;

        emailService.sendNewDeviceEmail(
                user.getEmail(),
                user.getFirstName(),
                info.getIp(),
                info.getUserAgent(),
                info.getPlatform(),
                info.getLanguage(),
                info.getTimezone(),
                now,
                confirmUrl,
                rejectUrl
        );

        return "PENDING:" + token;
    }

    private String frontendBaseUrl() {
        if (appFrontendUrl == null || appFrontendUrl.isBlank()) {
            return "http://localhost:4200";
        }
        return appFrontendUrl.trim().replaceAll("/+$", "");
    }

    /**
     * ✅ Méthode utilisée par DeviceConfirmController
     * Elle reçoit l'objet attempt (déjà trouvé par token),
     * et enregistre le device comme "known".
     */
    @Transactional
    public void confirmAttemptAndRegisterDevice(DeviceLoginAttempt attempt) {

        if (attempt == null) {
            throw new RuntimeException("Invalid token");
        }

        if (attempt.getStatus() != DeviceAttemptStatus.PENDING) {
            return; // déjà confirmé/rejeté/expiré
        }

        if (attempt.getExpiresAt().isBefore(LocalDateTime.now())) {
            attempt.setStatus(DeviceAttemptStatus.EXPIRED);
            attemptRepository.save(attempt);
            return;
        }

        // marquer confirmé
        attempt.setStatus(DeviceAttemptStatus.CONFIRMED);
        attemptRepository.save(attempt);

        // enregistrer dans known_devices si pas déjà موجود
        boolean exists = knownDeviceRepository.existsByUserIdAndDeviceId(
                attempt.getUser().getId(),
                attempt.getDeviceId()
        );

        if (!exists) {
            LocalDateTime now = LocalDateTime.now();
            KnownDevice kd = KnownDevice.builder()
                    .user(attempt.getUser())
                    .deviceId(attempt.getDeviceId())
                    .userAgent(attempt.getUserAgent())
                    .platform(attempt.getPlatform())
                    .language(attempt.getLanguage())
                    .timezone(attempt.getTimezone())
                    .lastIp(attempt.getIp())
                    .firstSeenAt(now)
                    .lastSeenAt(now)
                    .build();

            knownDeviceRepository.save(kd);
        }
    }

    // ✅ Si tu as encore des pages Angular qui appellent cette méthode, tu peux la garder
    @Transactional
    public String confirmAttemptAndTrustDevice(String token) {
        if (token == null || token.isBlank()) return "INVALID";
        String trimmed = token.trim();
        DeviceLoginAttempt a = attemptRepository.findByToken(trimmed).orElse(null);
        if (a == null) return "INVALID";

        if (a.getStatus() != DeviceAttemptStatus.PENDING) return "ALREADY_USED";

        if (a.getExpiresAt().isBefore(LocalDateTime.now())) {
            a.setStatus(DeviceAttemptStatus.EXPIRED);
            attemptRepository.save(a);
            return "EXPIRED";
        }

        a.setStatus(DeviceAttemptStatus.CONFIRMED);
        attemptRepository.save(a);

        boolean exists = knownDeviceRepository.existsByUserIdAndDeviceId(a.getUser().getId(), a.getDeviceId());
        if (!exists) {
            LocalDateTime now = LocalDateTime.now();
            KnownDevice kd = KnownDevice.builder()
                    .user(a.getUser())
                    .deviceId(a.getDeviceId())
                    .userAgent(a.getUserAgent())
                    .platform(a.getPlatform())
                    .language(a.getLanguage())
                    .timezone(a.getTimezone())
                    .lastIp(a.getIp())
                    .firstSeenAt(now)
                    .lastSeenAt(now)
                    .build();
            knownDeviceRepository.save(kd);
        }

        return "CONFIRMED";
    }

    @Transactional
    public String rejectAttempt(String token) {
        if (token == null || token.isBlank()) return "INVALID";
        String trimmed = token.trim();
        DeviceLoginAttempt a = attemptRepository.findByToken(trimmed).orElse(null);
        if (a == null) return "INVALID";

        if (a.getStatus() != DeviceAttemptStatus.PENDING) return "ALREADY_USED";

        a.setStatus(DeviceAttemptStatus.REJECTED);
        attemptRepository.save(a);
        return "REJECTED";
    }
}