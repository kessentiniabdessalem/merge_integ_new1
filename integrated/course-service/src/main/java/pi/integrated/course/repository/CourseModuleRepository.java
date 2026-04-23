package pi.integrated.course.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pi.integrated.course.entity.CourseModule;

import java.util.List;

@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {
    List<CourseModule> findByCourseIdOrderByOrderIndexAsc(Long courseId);
    boolean existsByCourseIdAndId(Long courseId, Long id);
    void deleteByCourseId(Long courseId);
}
