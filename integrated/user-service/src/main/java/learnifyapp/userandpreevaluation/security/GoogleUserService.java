package learnifyapp.userandpreevaluation.security;

import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.enums.Role;
import learnifyapp.userandpreevaluation.usermanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;

@Service
public class GoogleUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public GoogleUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> findByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        String e = email.trim().toLowerCase();
        return userRepository.findByEmailIgnoreCase(e);
    }

    public User createGoogleUser(String email, String fullName, String pictureUrl, Role desiredRole) {

        String firstName = "Google";
        String lastName = "User";

        if (fullName != null && !fullName.isBlank()) {
            String[] parts = fullName.trim().split("\\s+");
            firstName = parts[0];
            lastName = (parts.length > 1)
                    ? String.join(" ", Arrays.copyOfRange(parts, 1, parts.length))
                    : "User";
        }

        User u = new User();
        u.setEmail(email);
        u.setFirstName(firstName);
        u.setLastName(lastName);

        // password NOT NULL -> dummy
        u.setPassword(passwordEncoder.encode("GOOGLE_OAUTH2_ACCOUNT"));

        u.setRole(desiredRole);
        u.setAvatarUrl(pictureUrl);

        return userRepository.save(u);
    }

    /**
     * À chaque connexion Google pour un compte déjà enregistré : met à jour prénom, nom et photo
     * depuis OIDC (comme un flux SSO classique — évite profils vides si la ligne existait sans noms).
     */
    public User applyGoogleProfile(User user, String fullName, String pictureUrl) {
        if (fullName != null && !fullName.isBlank()) {
            String[] parts = fullName.trim().split("\\s+");
            user.setFirstName(parts[0]);
            user.setLastName(parts.length > 1
                    ? String.join(" ", Arrays.copyOfRange(parts, 1, parts.length))
                    : "User");
        } else if (namesMissing(user)) {
            fillPlaceholderNameFromEmail(user);
        }
        if (pictureUrl != null && !pictureUrl.isBlank()) {
            user.setAvatarUrl(pictureUrl);
        }
        return userRepository.save(user);
    }

    private static boolean namesMissing(User u) {
        return (u.getFirstName() == null || u.getFirstName().isBlank())
                && (u.getLastName() == null || u.getLastName().isBlank());
    }

    /** Dernier recours si Google ne renvoie aucun claim de nom (scopes / compte). */
    private static void fillPlaceholderNameFromEmail(User u) {
        String email = u.getEmail();
        if (email == null || !email.contains("@")) {
            return;
        }
        String local = email.substring(0, email.indexOf('@')).trim();
        if (local.isEmpty()) {
            return;
        }
        u.setFirstName(local);
        u.setLastName("User");
    }
}