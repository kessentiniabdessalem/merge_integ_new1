package learnifyapp.userandpreevaluation.usermanagement.repository;

import learnifyapp.userandpreevaluation.usermanagement.entity.QrLoginSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QrLoginSessionRepository extends JpaRepository<QrLoginSession, String> {
}

