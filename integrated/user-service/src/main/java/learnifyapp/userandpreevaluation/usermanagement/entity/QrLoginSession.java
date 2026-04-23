package learnifyapp.userandpreevaluation.usermanagement.entity;

import jakarta.persistence.*;
import learnifyapp.userandpreevaluation.usermanagement.enums.QrLoginStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "qr_login_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrLoginSession {

    @Id
    @Column(length = 36)
    private String id; // UUID string

    @Column(nullable = false, length = 64)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QrLoginStatus status;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime approvedAt;

    private LocalDateTime usedAt;

    @Column
    private Long approvedUserId;

    @Column(length = 64)
    private String exchangeCodeHash;
    @Column(length = 20)
    private String space; // "student" | "admin" | "tutor"
}

