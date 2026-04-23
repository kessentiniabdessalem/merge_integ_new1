package learnifyapp.userandpreevaluation.usermanagement.controller;

import jakarta.servlet.http.HttpServletRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.UserSessionDto;
import learnifyapp.userandpreevaluation.usermanagement.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserService userService;

    public MeController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/sessions")
    public List<UserSessionDto> mySessions(Principal principal) {
        String email = principal.getName();
        return userService.getSessionsForUser(email)
                .stream()
                .map(UserSessionDto::from)
                .toList();
    }

    // ✅ NEW: créer une session (utile pour Google OAuth redirect)
    @PostMapping("/sessions/track")
    public void trackSession(Principal principal, HttpServletRequest request) {

        String email = principal.getName();
        String userAgent = request.getHeader("User-Agent");

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        } else {
            ip = ip.split(",")[0].trim();
        }

        userService.createSessionFor(email, userAgent, ip);
    }
}