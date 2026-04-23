package pi.integrated.preevaluation.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pi.integrated.preevaluation.entity.PreevaluationAnswer;

import java.util.List;

public interface PreevaluationAnswerRepository extends JpaRepository<PreevaluationAnswer, Long> {

    @EntityGraph(attributePaths = {"question", "selectedOption"})
    List<PreevaluationAnswer> findByUserEmailAndIsCorrectFalse(String userEmail);

    @Modifying
    @Query("DELETE FROM PreevaluationAnswer a WHERE a.userEmail = :userEmail")
    void deleteAllByUserEmail(@Param("userEmail") String userEmail);
}
