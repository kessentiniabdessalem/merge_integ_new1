package learnifyapp.userandpreevaluation.webauthn.controller;

import learnifyapp.userandpreevaluation.webauthn.service.WebAuthnService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webauthn")
public class WebAuthnController {

    private final WebAuthnService service;

    public WebAuthnController(WebAuthnService service) {
        this.service = service;
    }

    // ===== Register (profile, authenticated) =====
    @PostMapping("/register/options")
    public Map<String, Object> registerOptions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return service.startRegistration(email);
    }

    @PostMapping("/register/verify")
    public ResponseEntity<?> registerVerify(@RequestBody Map<String, Object> body) throws Exception {
        String requestId = (String) body.get("requestId");
        Object credential = body.get("credential");

        service.finishRegistration(requestId, credential);

        return ResponseEntity.ok("Passkey enabled");
    }

    // ===== Login (public) =====

    // 1) username-first (email obligatoire) => filtré
    @PostMapping("/authenticate/options")
    public Map<String, Object> authenticateOptions(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email is required");
        }
        return service.startAssertion(email);
    }

    // 2) discover (sans email) => choisit le compte/passkey
    @PostMapping("/authenticate/options/discover")
    public Map<String, Object> authenticateOptionsDiscover() {
        return service.startAssertionDiscover();
    }

    @PostMapping("/authenticate/verify")
    public Map<String, Object> authenticateVerify(@RequestBody Map<String, Object> body) throws Exception {
        String requestId = (String) body.get("requestId");
        Object credential = body.get("credential");

        String token = service.finishAssertionAndIssueJwt(requestId, credential);
        return Map.of("token", token);
    }
}