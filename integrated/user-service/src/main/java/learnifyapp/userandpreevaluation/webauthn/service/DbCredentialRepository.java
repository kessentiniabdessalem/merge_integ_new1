package learnifyapp.userandpreevaluation.webauthn.service;

import com.yubico.webauthn.CredentialRepository;
import com.yubico.webauthn.RegisteredCredential;
import com.yubico.webauthn.data.ByteArray;
import com.yubico.webauthn.data.PublicKeyCredentialDescriptor;
import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.repository.UserRepository;
import learnifyapp.userandpreevaluation.webauthn.entity.WebAuthnCredential;
import learnifyapp.userandpreevaluation.webauthn.repository.WebAuthnCredentialRepository;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DbCredentialRepository implements CredentialRepository {

    private final WebAuthnCredentialRepository credRepo;
    private final UserRepository userRepo;

    public DbCredentialRepository(WebAuthnCredentialRepository credRepo, UserRepository userRepo) {
        this.credRepo = credRepo;
        this.userRepo = userRepo;
    }

    @Override
    public Set<PublicKeyCredentialDescriptor> getCredentialIdsForUsername(String username) {
        User user = userRepo.findByEmail(username).orElse(null);
        if (user == null) return Set.of();

        return credRepo.findAllByUserId(user.getId()).stream()
                .map(c -> PublicKeyCredentialDescriptor.builder()
                        .id(new ByteArray(c.getCredentialId()))
                        .build())
                .collect(Collectors.toSet());
    }

    @Override
    public Optional<ByteArray> getUserHandleForUsername(String username) {
        User user = userRepo.findByEmail(username).orElse(null);
        if (user == null) return Optional.empty();

        // userHandle stable => on utilise l'id
        return Optional.of(new ByteArray(Long.toString(user.getId()).getBytes()));
    }

    @Override
    public Optional<String> getUsernameForUserHandle(ByteArray userHandle) {
        String idStr = new String(userHandle.getBytes());
        try {
            Long userId = Long.valueOf(idStr);
            return userRepo.findById(userId).map(User::getEmail);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<RegisteredCredential> lookup(ByteArray credentialId, ByteArray userHandle) {
        return credRepo.findByCredentialId(credentialId.getBytes()).flatMap(c -> {
            String idStr = new String(userHandle.getBytes());
            if (!Objects.equals(Long.toString(c.getUserId()), idStr)) return Optional.empty();
            return Optional.of(toRegisteredCredential(c, userHandle));
        });
    }

    @Override
    public Set<RegisteredCredential> lookupAll(ByteArray credentialId) {
        return credRepo.findByCredentialId(credentialId.getBytes())
                .map(c -> {
                    ByteArray userHandle = new ByteArray(Long.toString(c.getUserId()).getBytes());
                    return Set.of(toRegisteredCredential(c, userHandle));
                })
                .orElse(Set.of());
    }

    private RegisteredCredential toRegisteredCredential(WebAuthnCredential c, ByteArray userHandle) {
        return RegisteredCredential.builder()
                .credentialId(new ByteArray(c.getCredentialId()))
                .userHandle(userHandle)
                .publicKeyCose(new ByteArray(c.getPublicKeyCose()))
                .signatureCount(c.getSignatureCount())
                .build();
    }
}