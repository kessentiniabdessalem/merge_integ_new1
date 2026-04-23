package pi.integrated.course.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pi.integrated.course.entity.Lesson;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByModuleIdOrderByOrderIndexAsc(Long moduleId);
    List<Lesson> findByCourseIdOrderByModuleOrderIndexAscOrderIndexAsc(Long courseId);
    boolean existsByModuleIdAndId(Long moduleId, Long id);
    boolean existsByModuleCourseIdAndModuleIdAndId(Long courseId, Long moduleId, Long id);
    void deleteByModuleId(Long moduleId);
}
