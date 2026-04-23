package pi.integrated.course.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pi.integrated.course.entity.Course;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByCategory(String category);
    List<Course> findByLevel(String level);
    List<Course> findByTeacher(String teacher);
    List<Course> findByTitleContainingIgnoreCase(String keyword);
}
