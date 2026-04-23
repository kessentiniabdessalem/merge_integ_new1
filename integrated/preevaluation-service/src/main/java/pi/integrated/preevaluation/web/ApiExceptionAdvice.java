package pi.integrated.preevaluation.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Réponses JSON avec champ {@code message} pour que le front Angular (comme ang) puisse afficher la cause.
 */
@RestControllerAdvice
public class ApiExceptionAdvice {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionAdvice.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", Optional.ofNullable(ex.getReason()).orElse(ex.getStatusCode().toString()));
        body.put("status", ex.getStatusCode().value());
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDataAccess(DataAccessException ex) {
        Throwable cause = ex.getMostSpecificCause();
        String detail = cause.getMessage() != null ? cause.getMessage() : ex.getMessage();
        log.error("Erreur d’accès aux données (preevaluation_db / JPA): {}", detail, ex);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Database error — vérifie MySQL, la base preevaluation_db, user/mot de passe. Cause: " + detail);
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        if (ex instanceof ResponseStatusException rse) {
            return handleResponseStatus(rse);
        }
        if (ex instanceof DataAccessException dae) {
            return handleDataAccess(dae);
        }
        Throwable root = ex;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        String detail = root.getMessage() != null ? root.getMessage() : ex.getClass().getSimpleName();
        log.error("Erreur API preevaluation-service: {}", detail, ex);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", detail);
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("type", ex.getClass().getSimpleName());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
