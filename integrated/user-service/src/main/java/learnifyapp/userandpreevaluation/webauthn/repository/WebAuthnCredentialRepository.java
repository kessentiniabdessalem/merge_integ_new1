package learnifyapp.userandpreevaluation.webauthn.repository;

import learnifyapp.userandpreevaluation.webauthn.entity.WebAuthnCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WebAuthnCredentialRepository extends JpaRepository<WebAuthnCredential, Long> {
    List<WebAuthnCredential> findAllByUserId(Long userId);
    Optional<WebAuthnCredential> findByCredentialId(byte[] credentialId);
}