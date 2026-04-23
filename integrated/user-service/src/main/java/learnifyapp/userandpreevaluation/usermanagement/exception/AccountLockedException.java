package learnifyapp.userandpreevaluation.usermanagement.exception;

import java.time.LocalDateTime;

/**
 * Levée lorsque le compte est bloqué après 3 tentatives de connexion échouées.
 * Le déblocage est possible par PIN envoyé par email.
 */
public class AccountLockedException extends RuntimeException {

    private final LocalDateTime lockedUntil;

    public AccountLockedException(String message, LocalDateTime lockedUntil) {
        super(message);
        this.lockedUntil = lockedUntil;
    }

    public LocalDateTime getLockedUntil() {
        return lockedUntil;
    }
}
