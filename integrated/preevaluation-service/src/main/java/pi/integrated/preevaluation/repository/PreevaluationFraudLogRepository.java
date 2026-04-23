package pi.integrated.preevaluation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pi.integrated.preevaluation.entity.PreevaluationFraudLog;

public interface PreevaluationFraudLogRepository extends JpaRepository<PreevaluationFraudLog, Long> {
}
