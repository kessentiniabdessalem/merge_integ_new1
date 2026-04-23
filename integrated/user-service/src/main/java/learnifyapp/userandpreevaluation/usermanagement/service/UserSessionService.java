package learnifyapp.userandpreevaluation.usermanagement.service;

import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.entity.UserSession;
import learnifyapp.userandpreevaluation.usermanagement.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserSessionService {

    private final UserSessionRepository userSessionRepository;

    public UserSession createSession(User user, String userAgent, String ip) {
        LocalDateTime now = LocalDateTime.now();

        UserSession s = new UserSession();
        s.setUser(user);
        s.setSessionId(UUID.randomUUID().toString()); // ✅ unique
        s.setUserAgent(userAgent);
        s.setIp(ip);
        s.setCreatedAt(now);
        s.setLastSeenAt(now);
        s.setRevoked(false);

        // browser / os : optionnel (tu peux laisser null)
        return userSessionRepository.save(s);
    }
}