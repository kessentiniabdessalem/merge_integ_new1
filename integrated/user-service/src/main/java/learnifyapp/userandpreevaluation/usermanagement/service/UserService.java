package learnifyapp.userandpreevaluation.usermanagement.service;

import learnifyapp.userandpreevaluation.security.JwtUtil;
import learnifyapp.userandpreevaluation.usermanagement.dto.ChangePasswordRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.LoginResponse;
import learnifyapp.userandpreevaluation.usermanagement.dto.NewDeviceInfo;
import learnifyapp.userandpreevaluation.usermanagement.dto.RegisterRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.UpdateProfileRequest;
import learnifyapp.userandpreevaluation.usermanagement.entity.PasswordResetToken;
import learnifyapp.userandpreevaluation.usermanagement.entity.UnblockPinToken;
import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.entity.UserSession;
import learnifyapp.userandpreevaluation.usermanagement.enums.Role;
import learnifyapp.userandpreevaluation.usermanagement.exception.AccountLockedException;
import learnifyapp.userandpreevaluation.usermanagement.exception.DeviceConfirmationRequiredException;
import learnifyapp.userandpreevaluation.usermanagement.exception.EmailAlreadyExistsException;
import learnifyapp.userandpreevaluation.usermanagement.repository.DeviceLoginAttemptRepository;
import learnifyapp.userandpreevaluation.usermanagement.repository.KnownDeviceRepository;
import learnifyapp.userandpreevaluation.usermanagement.repository.PasswordResetTokenRepository;
import learnifyapp.userandpreevaluation.usermanagement.repository.UnblockPinTokenRepository;
import learnifyapp.userandpreevaluation.usermanagement.repository.UserRepository;
import learnifyapp.userandpreevaluation.usermanagement.repository.UserSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserSessionRepository userSessionRepository;

    private final KnownDeviceRepository knownDeviceRepository;
    private final DeviceLoginAttemptRepository deviceLoginAttemptRepository;
    private final UnblockPinTokenRepository unblockPinTokenRepository;

    private final DeviceService deviceService;

    private static final int MAX_FAILED_ATTEMPTS = 3;
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(15);

    @Value("${app.skip-device-confirmation:false}")
    private boolean skipDeviceConfirmation;

    /** Local uniquement : log du PIN si l’e-mail (SendGrid) n’est pas configuré. */
    @Value("${app.security.log-unblock-pin-in-dev:false}")
    private boolean logUnblockPinInDev;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       EmailService emailService,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       UserSessionRepository userSessionRepository,
                       DeviceService deviceService,
                       DeviceLoginAttemptRepository deviceLoginAttemptRepository,
                       KnownDeviceRepository knownDeviceRepository,
                       UnblockPinTokenRepository unblockPinTokenRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userSessionRepository = userSessionRepository;
        this.deviceService = deviceService;
        this.deviceLoginAttemptRepository = deviceLoginAttemptRepository;
        this.knownDeviceRepository = knownDeviceRepository;
        this.unblockPinTokenRepository = unblockPinTokenRepository;
    }

    private static String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String e = email.trim().toLowerCase();
        return e.isEmpty() ? null : e;
    }

    // ================= REGISTER STUDENT =================
    public User registerStudent(RegisterRequest request) {

        String email = normalizeEmail(request.getEmail());
        if (email == null) {
            throw new RuntimeException("Email is required");
        }
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException();
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);

        User savedUser = userRepository.save(user);

        try {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFirstName());
        } catch (Exception e) {
            e.printStackTrace();
        }

        return savedUser;
    }

    // ================= REGISTER CANDIDATE =================
    public User registerCandidate(RegisterRequest request) {

        String email = normalizeEmail(request.getEmail());
        if (email == null) {
            throw new RuntimeException("Email is required");
        }
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException();
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CANDIDATE);

        return userRepository.save(user);
    }

    private static final String LEARNIFY_DOMAIN = "@learnify.com";
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private void validatePersonalEmail(String personalEmail, String learnifyEmail) {
        if (personalEmail == null || personalEmail.isBlank()) {
            throw new RuntimeException("Personal email is required");
        }
        String pe = personalEmail.trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(pe).matches()) {
            throw new RuntimeException("Invalid personal email format");
        }
        if (pe.endsWith("@learnify.com")) {
            throw new RuntimeException("Personal email must not end with @learnify.com");
        }
        if (learnifyEmail != null && !learnifyEmail.isBlank() && pe.equals(learnifyEmail.trim().toLowerCase())) {
            throw new RuntimeException("Personal email must be different from Learnify email");
        }
    }

    // ================= CREATE TUTOR =================
    public User createTutor(RegisterRequest request) {

        String learnifyEmail = normalizeEmail(request.getEmail());
        if (learnifyEmail == null) {
            throw new RuntimeException("Email is required");
        }
        if (userRepository.existsByEmail(learnifyEmail)) {
            throw new EmailAlreadyExistsException();
        }
        if (!learnifyEmail.endsWith(LEARNIFY_DOMAIN)) {
            throw new RuntimeException("Tutor Learnify email must end with @learnify.com");
        }

        validatePersonalEmail(request.getPersonalEmail(), learnifyEmail);

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(learnifyEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.TUTOR);

        User savedUser = userRepository.save(user);

        try {
            emailService.sendLearnifyAccountCreated(
                    request.getPersonalEmail().trim(),
                    learnifyEmail,
                    request.getPassword()
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

        return savedUser;
    }

    // ================= CREATE ADMIN =================
    public User createAdmin(RegisterRequest request) {

        String learnifyEmail = normalizeEmail(request.getEmail());
        if (learnifyEmail == null) {
            throw new RuntimeException("Email is required");
        }
        if (userRepository.existsByEmail(learnifyEmail)) {
            throw new EmailAlreadyExistsException();
        }
        if (!learnifyEmail.endsWith(LEARNIFY_DOMAIN)) {
            throw new RuntimeException("Admin Learnify email must end with @learnify.com");
        }

        validatePersonalEmail(request.getPersonalEmail(), learnifyEmail);

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(learnifyEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ADMIN);

        User savedUser = userRepository.save(user);

        try {
            emailService.sendLearnifyAccountCreated(
                    request.getPersonalEmail().trim(),
                    learnifyEmail,
                    request.getPassword()
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

        return savedUser;
    }

    // ================= LOGIN (OPTION 2) =================
    public LoginResponse login(String email,
                               String password,
                               String role,
                               String userAgent,
                               String ip,
                               String deviceId,
                               String platform,
                               String language,
                               String timezone) {

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password is required");
        }

        email = email.trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Compte bloqué après 3 tentatives échouées (15 min)
        LocalDateTime now = LocalDateTime.now();
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            throw new AccountLockedException("Account locked for 15 minutes. Use 'Unblock with PIN' to receive a PIN by email.", user.getLockedUntil());
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            int attempts = (user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0) + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(now.plus(LOCKOUT_DURATION));
                userRepository.save(user);
                throw new AccountLockedException("Account locked for 15 minutes. Use 'Unblock with PIN' to receive a PIN by email.", user.getLockedUntil());
            }
            userRepository.save(user);
            throw new RuntimeException("Invalid credentials");
        }

        // ✅ Succès : réinitialiser tentatives et blocage
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        // ✅ Si role non fourni (QR approve ou autre), on prend le rôle réel du user
        if (role == null || role.isBlank()) {
            role = user.getRole().name();
        }

        // ✅ Domain rule seulement si role demandé = ADMIN/TUTOR
        if ("ADMIN".equalsIgnoreCase(role) || "TUTOR".equalsIgnoreCase(role)) {
            if (!email.endsWith(LEARNIFY_DOMAIN)) {
                throw new RuntimeException("Admin and Tutor must login with their Learnify email (@learnify.com)");
            }
        }

        // ✅ Space check
        if (!user.getRole().name().equalsIgnoreCase(role)) {
            throw new RuntimeException("Access denied: wrong space for this account");
        }

        // ✅ 1) check device first (no token yet) — skip if app.skip-device-confirmation=true (e.g. dev / no gateway)
        if (!skipDeviceConfirmation) {
            NewDeviceInfo info = NewDeviceInfo.builder()
                    .deviceId(deviceId)
                    .userAgent(userAgent)
                    .platform(platform)
                    .language(language)
                    .timezone(timezone)
                    .ip(ip)
                    .build();

            String st = deviceService.checkDeviceOrCreateAttempt(user, info, "LOCAL", "LOGIN");

            if (st != null && st.startsWith("PENDING:")) {
                String pendingToken = st.split(":", 2)[1];
                throw new DeviceConfirmationRequiredException(pendingToken);
            }
        }

        // ✅ 2) device connu => générer JWT
        String token = jwtUtil.generateToken(email, user.getRole().name());

        // ✅ 3) save active session only if device known
        UserSession s = new UserSession();
        s.setUser(user);
        s.setSessionId(UUID.randomUUID().toString());
        s.setUserAgent(userAgent);
        s.setIp(ip);
        s.setBrowser(parseBrowser(userAgent));
        s.setOs(parseOs(userAgent));
        s.setCreatedAt(LocalDateTime.now());
        s.setLastSeenAt(LocalDateTime.now());
        s.setRevoked(false);

        userSessionRepository.save(s);

        return new LoginResponse(
                token,
                user.getRole().name(),
                user.getEmail()
        );
    }

    private String parseBrowser(String ua) {
        if (ua == null) return "Unknown";
        String u = ua.toLowerCase();
        if (u.contains("edg/")) return "Edge";
        if (u.contains("chrome/")) return "Chrome";
        if (u.contains("firefox/")) return "Firefox";
        if (u.contains("safari/") && !u.contains("chrome/")) return "Safari";
        return "Unknown";
    }

    private String parseOs(String ua) {
        if (ua == null) return "Unknown";
        String u = ua.toLowerCase();
        if (u.contains("windows")) return "Windows";
        if (u.contains("android")) return "Android";
        if (u.contains("iphone") || u.contains("ipad") || u.contains("ios")) return "iOS";
        if (u.contains("mac os") || u.contains("macintosh")) return "macOS";
        if (u.contains("linux")) return "Linux";
        return "Unknown";
    }

    // ================= FORGOT PASSWORD (SEND PIN) =================
    @Transactional
    public String forgotPassword(String email) {

        String genericMsg = "If this email exists, a PIN has been sent.";

        if (email == null || email.isBlank()) {
            return genericMsg;
        }

        email = email.trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            return genericMsg;
        }

        // Toujours utiliser l’e-mail canonique en base pour le token et l’envoi SendGrid
        email = user.getEmail() != null ? user.getEmail().trim().toLowerCase() : email;

        // ✅ Invalidate all previous active PINs
        passwordResetTokenRepository.invalidateAllActivePins(email);

        // ✅ Generate a new PIN
        String pin = String.format("%06d", new Random().nextInt(1_000_000));

        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setPin(pin);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        token.setUsed(false);

        passwordResetTokenRepository.save(token);

        // ✅ Send email (async)
        emailService.sendResetPinEmail(user.getEmail(), user.getFirstName(), pin);

        return genericMsg;
    }

    // ================= RESET PASSWORD (VERIFY PIN + UPDATE PASSWORD) =================
    @Transactional
    public void resetPasswordWithPin(String email, String pin, String newPassword, String confirmNewPassword) {

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (pin == null || pin.isBlank()) {
            throw new RuntimeException("PIN is required");
        }

        email = email.trim().toLowerCase();
        pin = pin.trim();

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }
        if (!newPassword.equals(confirmNewPassword)) {
            throw new RuntimeException("Passwords do not match");
        }

        PasswordResetToken token = passwordResetTokenRepository
                .findTopByEmailAndPinAndUsedFalseOrderByIdDesc(email, pin)
                .orElseThrow(() -> new RuntimeException("Invalid PIN"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("PIN expired");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    // ================= UNBLOCK ACCOUNT (après 3 échecs) =================
    @Transactional
    public void requestUnblockPin(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        email = email.trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getLockedUntil() == null || user.getLockedUntil().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Account is not locked");
        }
        unblockPinTokenRepository.invalidateAllActivePins(email);
        String pin = String.format("%06d", new Random().nextInt(1_000_000));
        UnblockPinToken token = new UnblockPinToken();
        token.setEmail(email);
        token.setPin(pin);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        token.setUsed(false);
        unblockPinTokenRepository.save(token);
        emailService.sendUnblockPinEmail(user.getEmail(), user.getFirstName(), pin);
        if (logUnblockPinInDev) {
            log.warn("[DEV] PIN de déblocage pour {} : {} — désactive app.security.log-unblock-pin-in-dev en production", email, pin);
        }
    }

    @Transactional
    public void verifyUnblockPin(String email, String pin) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (pin == null || pin.isBlank()) {
            throw new RuntimeException("PIN is required");
        }
        email = email.trim().toLowerCase();
        pin = pin.trim();
        UnblockPinToken token = unblockPinTokenRepository
                .findTopByEmailAndPinAndUsedFalseOrderByIdDesc(email, pin)
                .orElseThrow(() -> new RuntimeException("Invalid PIN"));
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("PIN expired");
        }
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new RuntimeException("User not found"));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        token.setUsed(true);
        unblockPinTokenRepository.save(token);
    }

    // ================= PROFILE =================
    public User getByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("User not found");
        }
        return userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(String currentEmail, UpdateProfileRequest req) {
        User user = getByEmail(currentEmail);

        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null) user.setLastName(req.getLastName());

        if (req.getEmail() != null && !req.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail())) {
                throw new EmailAlreadyExistsException();
            }
            user.setEmail(req.getEmail());
        }

        return userRepository.save(user);
    }

    public void changePassword(String email, ChangePasswordRequest req) {
        User user = getByEmail(email);

        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }
        if (!req.getNewPassword().equals(req.getConfirmNewPassword())) {
            throw new RuntimeException("Passwords do not match");
        }
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    // ================= AVATAR =================
    public User uploadAvatar(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/png") || contentType.equals("image/jpeg") || contentType.equals("image/jpg"))) {
            throw new RuntimeException("Only PNG/JPG images are allowed");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Path uploadDir = Paths.get("uploads/avatars");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String ext = contentType.equals("image/png") ? ".png" : ".jpg";
            String filename = UUID.randomUUID() + ext;

            Path targetPath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            user.setAvatarUrl("/uploads/avatars/" + filename);
            return userRepository.save(user);

        } catch (Exception e) {
            throw new RuntimeException("Upload failed: " + e.getMessage());
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> findUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    // ✅ UPDATED: block delete if user has active sessions
    @Transactional
    public void deleteUser(Long id) {

        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("admin@learnify.com".equalsIgnoreCase(u.getEmail())) {
            throw new RuntimeException("Cannot delete system admin");
        }

        // ✅ 1) supprimer d'abord les tables enfants (FK)
        userSessionRepository.deleteAllByUserId(id);
        knownDeviceRepository.deleteAllByUserId(id);
        deviceLoginAttemptRepository.deleteAllByUserId(id);

        // ✅ 2) puis supprimer l'utilisateur
        userRepository.deleteById(id);
    }

    public List<UserSession> getSessionsForUser(String email) {
        User user = getByEmail(email);
        return userSessionRepository.findByUserIdOrderByLastSeenAtDesc(user.getId());
    }

    public void createSessionFor(String email, String userAgent, String ip) {
        User user = getByEmail(email);

        UserSession s = new UserSession();
        s.setUser(user);
        s.setSessionId(UUID.randomUUID().toString());
        s.setUserAgent(userAgent);
        s.setIp(ip);
        s.setBrowser(parseBrowser(userAgent));
        s.setOs(parseOs(userAgent));
        s.setCreatedAt(LocalDateTime.now());
        s.setLastSeenAt(LocalDateTime.now());
        s.setRevoked(false);

        userSessionRepository.save(s);
    }

    public User getUserByAttemptToken(String token) {
        return deviceLoginAttemptRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"))
                .getUser();
    }

    /** Appelé par preevaluation-service (JWT étudiant) après fin du test. */
    @Transactional
    public void updatePreevaluationFinalLevel(String email, String finalLevel) {
        if (finalLevel == null || finalLevel.isBlank()) {
            throw new IllegalArgumentException("finalLevel required");
        }
        User user = getByEmail(email);
        if (user.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students have pre-evaluation levels");
        }
        user.setPreevaluationFinalLevel(finalLevel.trim().toUpperCase());
        userRepository.save(user);
    }
}