package learnifyapp.userandpreevaluation.usermanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Token PIN pour débloquer un compte après blocage (3 tentatives échouées).
 * Séparé de PasswordResetToken pour ne pas affecter la logique forgot-password.
 */
@Entity
@Table(name = "unblock_pin_token")
public class UnblockPinToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String pin;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    public Long getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
}
