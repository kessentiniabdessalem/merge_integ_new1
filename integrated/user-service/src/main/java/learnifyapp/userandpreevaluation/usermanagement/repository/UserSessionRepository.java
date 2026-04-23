package learnifyapp.userandpreevaluation.usermanagement.repository;

import learnifyapp.userandpreevaluation.usermanagement.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    List<UserSession> findByUserIdOrderByLastSeenAtDesc(Long userId);

    Optional<UserSession> findBySessionId(String sessionId);

    // ✅ NEW: vérifier s'il existe une session active (revoked = false)
    boolean existsByUserIdAndRevokedFalse(Long userId);

    // ✅ delete all sessions for a user (important before deleting the user)
    @Modifying
    @Transactional
    @Query("delete from UserSession s where s.user.id = :userId")
    void deleteAllByUserId(Long userId);
}