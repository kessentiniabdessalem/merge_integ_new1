package pi.integrated.preevaluation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pi.integrated.preevaluation.EnglishLevel;
import pi.integrated.preevaluation.entity.PreevaluationLevelSelection;

import java.util.List;
import java.util.Optional;

public interface PreevaluationLevelSelectionRepository extends JpaRepository<PreevaluationLevelSelection, Long> {

    /** Même convention booléenne que ang/UserAndPreevaluation (SubmittedFalse / …True). */
    Optional<PreevaluationLevelSelection> findByUserEmailAndLevelAndSubmittedFalse(String userEmail, EnglishLevel level);

    List<PreevaluationLevelSelection> findAllByUserEmailAndSubmittedTrueAndPassedTrue(String userEmail);

    Optional<PreevaluationLevelSelection> findFirstByUserEmailAndSubmittedFalseOrderByIdDesc(String userEmail);

    Optional<PreevaluationLevelSelection> findFirstByUserEmailAndSubmittedTrueAndPassedFalseOrderByIdDesc(String userEmail);

    List<PreevaluationLevelSelection> findAllByUserEmail(String userEmail);
}
