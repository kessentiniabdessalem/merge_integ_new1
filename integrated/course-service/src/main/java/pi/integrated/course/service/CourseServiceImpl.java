package pi.integrated.course.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.integrated.course.dto.CourseRequest;
import pi.integrated.course.dto.CourseResponse;
import pi.integrated.course.dto.ModuleResponse;
import pi.integrated.course.entity.Course;
import pi.integrated.course.exception.CourseException;
import pi.integrated.course.repository.CourseModuleRepository;
import pi.integrated.course.repository.CourseRepository;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements ICourseService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final CourseModuleServiceImpl moduleService;

    @Override
    public CourseResponse createCourse(CourseRequest request) {
        Course course = Course.builder()
                .title(request.getTitle())
                .category(request.getCategory())
                .level(request.getLevel())
                .description(request.getDescription())
                .duration(request.getDuration())
                .price(request.getPrice())
                .teacher(request.getTeacher())
                .image(request.getImage())
                .thumbnail(request.getThumbnail())
                .studentsCount(request.getStudentsCount() != null ? request.getStudentsCount() : 0)
                .build();
        return toResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new CourseException("Course not found with id: " + id));
        return toResponse(course);
    }

    @Override
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseResponse> getCoursesByCategory(String category) {
        return courseRepository.findByCategory(category).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseResponse> getCoursesByLevel(String level) {
        return courseRepository.findByLevel(level).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseResponse> searchCourses(String keyword) {
        return courseRepository.findByTitleContainingIgnoreCase(keyword).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new CourseException("Course not found with id: " + id));
        course.setTitle(request.getTitle());
        course.setCategory(request.getCategory());
        course.setLevel(request.getLevel());
        course.setDescription(request.getDescription());
        course.setDuration(request.getDuration());
        course.setPrice(request.getPrice());
        course.setTeacher(request.getTeacher());
        course.setImage(request.getImage());
        course.setThumbnail(request.getThumbnail());
        if (request.getStudentsCount() != null) {
            course.setStudentsCount(request.getStudentsCount());
        }
        return toResponse(courseRepository.save(course));
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new CourseException("Course not found with id: " + id);
        }
        // Delete modules (and their lessons via cascade) before deleting the course
        moduleRepository.deleteByCourseId(id);
        courseRepository.deleteById(id);
    }

    private CourseResponse toResponse(Course course) {
        List<ModuleResponse> modules = Collections.emptyList();
        try {
            modules = moduleRepository.findByCourseIdOrderByOrderIndexAsc(course.getId())
                    .stream().map(moduleService::toResponse).collect(Collectors.toList());
        } catch (Exception ignored) {
            // modules may not exist yet
        }
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .category(course.getCategory())
                .level(course.getLevel())
                .description(course.getDescription())
                .duration(course.getDuration())
                .price(course.getPrice())
                .teacher(course.getTeacher())
                .image(course.getImage())
                .thumbnail(course.getThumbnail())
                .studentsCount(course.getStudentsCount())
                .createdAt(course.getCreatedAt())
                .modules(modules)
                .build();
    }
}
