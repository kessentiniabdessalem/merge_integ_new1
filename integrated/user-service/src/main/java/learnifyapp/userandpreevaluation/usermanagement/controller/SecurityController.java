package learnifyapp.userandpreevaluation.usermanagement.controller;

import learnifyapp.userandpreevaluation.security.JwtUtil;
import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class SecurityController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public SecurityController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // ✅ ME (profil du user connecté)
    @GetMapping("/me")
    public ResponseEntity<User> me(@RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "").trim();

        // ⚠️ adapte selon ta méthode existante dans JwtUtil
        // si tu as extractUsername au lieu de extractEmail => remplace ici
        String email = jwtUtil.extractEmail(token);

        User user = userService.getByEmail(email);
        return ResponseEntity.ok(user);
    }

    // (optionnel)
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out");
    }
}