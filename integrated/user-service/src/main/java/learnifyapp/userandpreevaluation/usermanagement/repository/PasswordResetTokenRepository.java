package learnifyapp.userandpreevaluation.usermanagement.repository;

import learnifyapp.userandpreevaluation.usermanagement.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findTopByEmailAndPinAndUsedFalseOrderByIdDesc(String email, String pin);

    // ✅ Invalidate all previous active PINs for this email
    @Modifying
    @Query("update PasswordResetToken t set t.used = true where t.email = :email and t.used = false")
    int invalidateAllActivePins(@Param("email") String email);
}