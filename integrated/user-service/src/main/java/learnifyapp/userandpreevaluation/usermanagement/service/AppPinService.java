package learnifyapp.userandpreevaluation.usermanagement.service;

import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AppPinService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    public AppPinService(UserRepository userRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    public void setPin(String email, String pin) {
        if (pin == null || !pin.matches("\\d{4,6}")) {
            throw new RuntimeException("PIN must be 4 to 6 digits");
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setAppPinHash(encoder.encode(pin));
        userRepo.save(user);
    }

    public boolean verifyPin(String email, String pin) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAppPinHash() == null) return false;
        return encoder.matches(pin, user.getAppPinHash());
    }

    public boolean hasPin(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getAppPinHash() != null;
    }
}