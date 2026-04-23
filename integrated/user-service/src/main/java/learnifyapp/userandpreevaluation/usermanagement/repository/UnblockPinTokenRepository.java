package learnifyapp.userandpreevaluation.usermanagement.repository;

import learnifyapp.userandpreevaluation.usermanagement.entity.UnblockPinToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UnblockPinTokenRepository extends JpaRepository<UnblockPinToken, Long> {

    Optional<UnblockPinToken> findTopByEmailAndPinAndUsedFalseOrderByIdDesc(String email, String pin);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update UnblockPinToken t set t.used = true where t.email = :email and t.used = false")
    int invalidateAllActivePins(@Param("email") String email);
}
