package pi.integrated.preevaluation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pi.integrated.preevaluation.entity.PreevaluationResult;

import java.util.Optional;

public interface PreevaluationResultRepository extends JpaRepository<PreevaluationResult, Long> {

    Optional<PreevaluationResult> findByUserEmail(String userEmail);
}
