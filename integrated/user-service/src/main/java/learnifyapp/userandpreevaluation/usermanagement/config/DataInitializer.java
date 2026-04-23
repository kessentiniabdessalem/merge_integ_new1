package learnifyapp.userandpreevaluation.usermanagement.config;

import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.enums.Role;
import learnifyapp.userandpreevaluation.usermanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final String ADMIN_EMAIL = "admin@learnify.com";

    @Value("${learnify.dev.reset-admin-password:false}")
    private boolean resetAdminPassword;

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {

            if (!userRepository.existsByEmail(ADMIN_EMAIL)) {

                User admin = new User();

                admin.setFirstName("System");
                admin.setLastName("Admin");
                admin.setEmail(ADMIN_EMAIL);

                admin.setPassword(passwordEncoder.encode("admin123"));

                admin.setRole(Role.ADMIN);

                userRepository.save(admin);

                System.out.println("[Learnify user-service] Compte admin créé : " + ADMIN_EMAIL + " / admin123");
            } else {
                System.out.println("[Learnify user-service] Admin déjà présent (" + ADMIN_EMAIL + "). Onglet « Admin » + orthographe learnify.");
            }

            if (resetAdminPassword) {
                userRepository.findByEmail(ADMIN_EMAIL).ifPresent(u -> {
                    u.setPassword(passwordEncoder.encode("admin123"));
                    u.setFailedLoginAttempts(0);
                    u.setLockedUntil(null);
                    userRepository.save(u);
                    System.out.println("[Learnify user-service] Mot de passe " + ADMIN_EMAIL + " réinitialisé -> admin123 (compte déverrouillé).");
                });
            }
        };
    }
}
