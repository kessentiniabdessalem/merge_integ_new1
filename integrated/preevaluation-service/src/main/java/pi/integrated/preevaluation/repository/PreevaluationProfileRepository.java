package pi.integrated.preevaluation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pi.integrated.preevaluation.entity.PreevaluationProfile;

import java.util.Optional;

public interface PreevaluationProfileRepository extends JpaRepository<PreevaluationProfile, Long> {

    Optional<PreevaluationProfile> findByUserEmail(String userEmail);
}
