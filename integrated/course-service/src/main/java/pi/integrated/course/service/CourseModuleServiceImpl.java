package pi.integrated.course.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.integrated.course.dto.LessonResponse;
import pi.integrated.course.dto.ModuleRequest;
import pi.integrated.course.dto.ModuleResponse;
import pi.integrated.course.entity.Course;
import pi.integrated.course.entity.CourseModule;
import pi.integrated.course.exception.CourseException;
import pi.integrated.course.repository.CourseModuleRepository;
import pi.integrated.course.repository.CourseRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseModuleServiceImpl implements ICourseModuleService {

    private final CourseModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    @Override
    @Transactional
    public ModuleResponse createModule(Long courseId, ModuleRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseException("Course not found: " + courseId));
        CourseModule module = CourseModule.builder()
                .course(course)
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .durationMinutes(request.getDurationMinutes())
                .build();
        return toResponse(moduleRepository.save(module));
    }

    @Override
    public ModuleResponse getModuleById(Long courseId, Long moduleId) {
        return toResponse(findModule(courseId, moduleId));
    }

    @Override
    public List<ModuleResponse> getModulesByCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new CourseException("Course not found: " + courseId);
        }
        return moduleRepository.findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ModuleResponse updateModule(Long courseId, Long moduleId, ModuleRequest request) {
        CourseModule module = findModule(courseId, moduleId);
        module.setTitle(request.getTitle());
        module.setDescription(request.getDescription());
        if (request.getOrderIndex() != null) module.setOrderIndex(request.getOrderIndex());
        module.setDurationMinutes(request.getDurationMinutes());
        return toResponse(moduleRepository.save(module));
    }

    @Override
    @Transactional
    public void deleteModule(Long courseId, Long moduleId) {
        moduleRepository.delete(findModule(courseId, moduleId));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private CourseModule findModule(Long courseId, Long moduleId) {
        CourseModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new CourseException("Module not found: " + moduleId));
        if (!module.getCourse().getId().equals(courseId)) {
            throw new CourseException("Module " + moduleId + " does not belong to course " + courseId);
        }
        return module;
    }

    public ModuleResponse toResponse(CourseModule module) {
        List<LessonResponse> lessonResponses = module.getLessons().stream()
                .map(l -> LessonResponse.builder()
                        .id(l.getId())
                        .moduleId(module.getId())
                        .courseId(module.getCourse().getId())
                        .title(l.getTitle())
                        .description(l.getDescription())
                        .orderIndex(l.getOrderIndex())
                        .durationMinutes(l.getDurationMinutes())
                        .videoUrl(l.getVideoUrl())
                        .build())
                .collect(Collectors.toList());

        return ModuleResponse.builder()
                .id(module.getId())
                .courseId(module.getCourse().getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .orderIndex(module.getOrderIndex())
                .durationMinutes(module.getDurationMinutes())
                .lessons(lessonResponses)
                .build();
    }
}
