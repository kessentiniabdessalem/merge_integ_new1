package pi.integrated.preevaluation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pi.integrated.preevaluation.entity.PreevaluationFraudTracking;

import java.util.Optional;

public interface PreevaluationFraudTrackingRepository extends JpaRepository<PreevaluationFraudTracking, Long> {

    Optional<PreevaluationFraudTracking> findByUserEmail(String userEmail);

    @Modifying
    @Query("DELETE FROM PreevaluationFraudTracking f WHERE f.userEmail = :userEmail")
    void deleteByUserEmail(@Param("userEmail") String userEmail);
}
