package pi.integrated.course.service;

import pi.integrated.course.dto.LessonRequest;
import pi.integrated.course.dto.LessonResponse;

import java.util.List;

public interface ILessonService {
    LessonResponse createLesson(Long courseId, Long moduleId, LessonRequest request);
    LessonResponse getLessonById(Long courseId, Long moduleId, Long lessonId);
    List<LessonResponse> getLessonsByModule(Long courseId, Long moduleId);
    LessonResponse updateLesson(Long courseId, Long moduleId, Long lessonId, LessonRequest request);
    void deleteLesson(Long courseId, Long moduleId, Long lessonId);
}
