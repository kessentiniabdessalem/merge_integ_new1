package learnifyapp.userandpreevaluation.usermanagement.repository;

import learnifyapp.userandpreevaluation.usermanagement.entity.DeviceLoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface DeviceLoginAttemptRepository extends JpaRepository<DeviceLoginAttempt, Long> {

    Optional<DeviceLoginAttempt> findByToken(String token);

    // ✅ NEW: delete all attempts for a user (important before deleting the user)
    @Modifying
    @Transactional
    @Query("delete from DeviceLoginAttempt a where a.user.id = :userId")
    void deleteAllByUserId(Long userId);
}