package pi.integrated.jobservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.integrated.jobservice.model.Rating;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByTeacherId(Long teacherId);

    List<Rating> findByStudentId(Long studentId);

    @Query("SELECT AVG(r.note) FROM Rating r WHERE r.teacherId = :teacherId")
    Double getAverageRatingForTeacher(Long teacherId);

    boolean existsByTeacherIdAndStudentId(Long teacherId, Long studentId);
}
