package pi.integrated.course.service;

import pi.integrated.course.dto.CourseRequest;
import pi.integrated.course.dto.CourseResponse;

import java.util.List;

public interface ICourseService {
    CourseResponse createCourse(CourseRequest request);
    CourseResponse getCourseById(Long id);
    List<CourseResponse> getAllCourses();
    List<CourseResponse> getCoursesByCategory(String category);
    List<CourseResponse> getCoursesByLevel(String level);
    List<CourseResponse> searchCourses(String keyword);
    CourseResponse updateCourse(Long id, CourseRequest request);
    void deleteCourse(Long id);
}
