package learnifyapp.userandpreevaluation.webauthn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "webauthn_credentials")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WebAuthnCredential {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Lob
    @Column(name = "credential_id", nullable = false, length = 255)
    private byte[] credentialId;

    @Lob
    @Column(name = "public_key_cose", nullable = false)
    private byte[] publicKeyCose;

    @Column(name = "signature_count", nullable = false)
    private long signatureCount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}