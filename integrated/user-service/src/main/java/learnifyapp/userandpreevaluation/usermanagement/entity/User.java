package learnifyapp.userandpreevaluation.usermanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import learnifyapp.userandpreevaluation.usermanagement.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;




@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String avatarUrl;

    @Column(length = 2000)
    private String about;

    @Column(name = "app_pin_hash")
    private String appPinHash;

    /** Nombre de tentatives de connexion échouées (réinitialisé à 0 après succès ou déblocage). */
    @Column(name = "failed_login_attempts", nullable = false)
    private Integer failedLoginAttempts = 0;

    /** Fin du blocage (null si compte non bloqué). Blocage 15 min après 3 échecs. */
    @Column(name = "locked_until")
    private java.time.LocalDateTime lockedUntil;

    /** Niveau final issu du microservice preevaluation-service (nullable). */
    @Column(name = "preevaluation_final_level", length = 8)
    private String preevaluationFinalLevel;

    public String getAppPinHash() { return appPinHash; }
    public void setAppPinHash(String appPinHash) { this.appPinHash = appPinHash; }

}
