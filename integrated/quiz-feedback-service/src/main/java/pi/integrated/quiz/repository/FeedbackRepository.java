package pi.integrated.quiz.repository;

import pi.integrated.quiz.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    List<Feedback> findByQuizId(Long quizId);
    
    List<Feedback> findByStudentId(Long studentId);
    
    List<Feedback> findByCourseId(Long courseId);
    
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.quizId = :quizId")
    Double getAverageRatingByQuizId(@Param("quizId") Long quizId);
    
    boolean existsByQuizIdAndStudentId(Long quizId, Long studentId);
}
