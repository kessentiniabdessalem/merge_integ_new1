package learnifyapp.userandpreevaluation.usermanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "known_devices",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "device_id"})
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class KnownDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ deviceId envoyé par le front (localStorage)
    @Column(name = "device_id", nullable = false, length = 128)
    private String deviceId;

    @Column(name = "user_agent", length = 1024)
    private String userAgent;

    @Column(name = "platform", length = 255)
    private String platform;

    @Column(name = "language", length = 32)
    private String language;

    @Column(name = "timezone", length = 128)
    private String timezone;

    @Column(name = "last_ip", length = 64)
    private String lastIp;

    @Column(name = "first_seen_at", nullable = false)
    private LocalDateTime firstSeenAt;

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}