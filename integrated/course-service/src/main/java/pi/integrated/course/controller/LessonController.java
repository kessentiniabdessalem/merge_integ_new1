package pi.integrated.course.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.integrated.course.dto.LessonRequest;
import pi.integrated.course.dto.LessonResponse;
import pi.integrated.course.service.ILessonService;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/modules/{moduleId}/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final ILessonService lessonService;

    // Public endpoints
    @GetMapping
    public ResponseEntity<List<LessonResponse>> getLessons(
            @PathVariable Long courseId,
            @PathVariable Long moduleId) {
        return ResponseEntity.ok(lessonService.getLessonsByModule(courseId, moduleId));
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<LessonResponse> getLesson(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId) {
        return ResponseEntity.ok(lessonService.getLessonById(courseId, moduleId, lessonId));
    }

    // Admin endpoints
    @PostMapping("/admin")
    public ResponseEntity<LessonResponse> createLesson(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @RequestBody LessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(lessonService.createLesson(courseId, moduleId, request));
    }

    @PutMapping("/admin/{lessonId}")
    public ResponseEntity<LessonResponse> updateLesson(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId,
            @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.updateLesson(courseId, moduleId, lessonId, request));
    }

    @DeleteMapping("/admin/{lessonId}")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @PathVariable Long lessonId) {
        lessonService.deleteLesson(courseId, moduleId, lessonId);
        return ResponseEntity.noContent().build();
    }
}
