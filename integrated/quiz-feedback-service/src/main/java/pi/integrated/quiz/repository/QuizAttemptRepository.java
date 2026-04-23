package pi.integrated.quiz.repository;

import pi.integrated.quiz.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    
    List<QuizAttempt> findByQuizId(Long quizId);
    
    List<QuizAttempt> findByStudentId(Long studentId);
    
    Optional<QuizAttempt> findByQuizIdAndStudentId(Long quizId, Long studentId);
    
    @Query("SELECT AVG(qa.score) FROM QuizAttempt qa WHERE qa.quizId = :quizId")
    Double getAverageScoreByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT COUNT(qa) FROM QuizAttempt qa WHERE qa.quizId = :quizId AND qa.passed = true")
    Long countPassedAttemptsByQuizId(@Param("quizId") Long quizId);
}
