package learnifyapp.userandpreevaluation.usermanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_sessions")
public class UserSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String sessionId; // UUID

    @Column(length = 500)
    private String userAgent;

    private String browser;
    private String os;

    private String ip;

    private LocalDateTime createdAt;
    private LocalDateTime lastSeenAt;

    private boolean revoked;
}