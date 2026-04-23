package learnifyapp.userandpreevaluation.usermanagement.exception;

import learnifyapp.userandpreevaluation.usermanagement.dto.ApiErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleUserNotFound(UsernameNotFoundException ex) {
        log.warn("User not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiErrorResponse("USER_NOT_FOUND", "Please log in again."));
    }

    /** Même contrat que {@code AuthController#login} si l’exception n’est pas attrapée au niveau du contrôleur. */
    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<Map<String, Object>> handleAccountLocked(AccountLockedException ex) {
        log.warn("Account locked: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.LOCKED).body(Map.of(
                "code", "ACCOUNT_LOCKED",
                "message", ex.getMessage() != null ? ex.getMessage() : "Account locked",
                "lockedUntil", ex.getLockedUntil() != null ? ex.getLockedUntil().toString() : ""
        ));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleEmailExists(EmailAlreadyExistsException ex) {
        log.warn("Email already registered");
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiErrorResponse("EMAIL_EXISTS", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        String root = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : "";
        if (root != null && root.contains("Duplicate entry")
                && (root.contains("email") || root.contains("users"))) {
            log.warn("Duplicate email constraint: {}", root);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiErrorResponse("EMAIL_EXISTS",
                            "This email is already registered. Try signing in."));
        }
        log.error("Data integrity violation", ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorResponse("ERROR", "Could not complete the request."));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiErrorResponse> handleRuntime(RuntimeException ex) {
        log.error("Request failed with RuntimeException", ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorResponse("ERROR", ex.getMessage() != null ? ex.getMessage() : "An error occurred"));
    }

    @ExceptionHandler(DeviceConfirmationRequiredException.class)
    public ResponseEntity<ApiErrorResponse> handle(DeviceConfirmationRequiredException ex) {
        return ResponseEntity.status(403)
                .body(new ApiErrorResponse(
                        "DEVICE_CONFIRM_REQUIRED",
                        "Check your email to confirm this device."
                ));
    }

    // ✅ NEW: when trying to delete a user who has active sessions
    @ExceptionHandler(ActiveSessionsException.class)
    public ResponseEntity<ApiErrorResponse> handle(ActiveSessionsException ex) {
        return ResponseEntity.status(409)
                .body(new ApiErrorResponse(
                        "ACTIVE_SESSIONS",
                        ex.getMessage()
                ));
    }
}