package pi.integrated.course.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.integrated.course.dto.LessonRequest;
import pi.integrated.course.dto.LessonResponse;
import pi.integrated.course.entity.Course;
import pi.integrated.course.entity.CourseModule;
import pi.integrated.course.entity.Lesson;
import pi.integrated.course.exception.CourseException;
import pi.integrated.course.repository.CourseModuleRepository;
import pi.integrated.course.repository.CourseRepository;
import pi.integrated.course.repository.LessonRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements ILessonService {

    private final LessonRepository lessonRepository;
    private final CourseModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    @Override
    @Transactional
    public LessonResponse createLesson(Long courseId, Long moduleId, LessonRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseException("Course not found: " + courseId));
        CourseModule module = findModule(courseId, moduleId);

        Lesson lesson = Lesson.builder()
                .course(course)
                .module(module)
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .durationMinutes(request.getDurationMinutes())
                .videoUrl(request.getVideoUrl())
                .build();
        return toResponse(lessonRepository.save(lesson));
    }

    @Override
    public LessonResponse getLessonById(Long courseId, Long moduleId, Long lessonId) {
        return toResponse(findLesson(courseId, moduleId, lessonId));
    }

    @Override
    public List<LessonResponse> getLessonsByModule(Long courseId, Long moduleId) {
        findModule(courseId, moduleId); // validate ownership
        return lessonRepository.findByModuleIdOrderByOrderIndexAsc(moduleId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long courseId, Long moduleId, Long lessonId, LessonRequest request) {
        Lesson lesson = findLesson(courseId, moduleId, lessonId);
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        if (request.getOrderIndex() != null) lesson.setOrderIndex(request.getOrderIndex());
        lesson.setDurationMinutes(request.getDurationMinutes());
        lesson.setVideoUrl(request.getVideoUrl());
        return toResponse(lessonRepository.save(lesson));
    }

    @Override
    @Transactional
    public void deleteLesson(Long courseId, Long moduleId, Long lessonId) {
        lessonRepository.delete(findLesson(courseId, moduleId, lessonId));
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

    private Lesson findLesson(Long courseId, Long moduleId, Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new CourseException("Lesson not found: " + lessonId));
        if (!lesson.getModule().getId().equals(moduleId)) {
            throw new CourseException("Lesson " + lessonId + " does not belong to module " + moduleId);
        }
        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new CourseException("Lesson " + lessonId + " does not belong to course " + courseId);
        }
        return lesson;
    }

    public LessonResponse toResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .moduleId(lesson.getModule().getId())
                .courseId(lesson.getCourse().getId())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .orderIndex(lesson.getOrderIndex())
                .durationMinutes(lesson.getDurationMinutes())
                .videoUrl(lesson.getVideoUrl())
                .build();
    }
}
