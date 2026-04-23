package learnifyapp.userandpreevaluation.usermanagement.entity;

import jakarta.persistence.*;
import learnifyapp.userandpreevaluation.usermanagement.enums.DeviceAttemptStatus;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "device_login_attempts", indexes = {
        @Index(name = "idx_device_attempt_token", columnList = "token", unique = true)
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DeviceLoginAttempt {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    @Column(name="device_id", nullable = false, length = 128)
    private String deviceId;

    @Column(name="user_agent", length = 1024)
    private String userAgent;

    @Column(length = 64)
    private String ip;

    @Column(length = 255)
    private String platform;

    @Column(length = 32)
    private String language;

    @Column(length = 128)
    private String timezone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DeviceAttemptStatus status;

    @Column(nullable = false, unique = true, length = 128)
    private String token; // UUID

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(length = 16) private String provider; // GOOGLE / LOCAL
    @Column(length = 16) private String mode;     // LOGIN / SIGNUP
}