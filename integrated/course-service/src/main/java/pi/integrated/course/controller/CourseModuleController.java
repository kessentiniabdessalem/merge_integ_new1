package pi.integrated.course.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.integrated.course.dto.ModuleRequest;
import pi.integrated.course.dto.ModuleResponse;
import pi.integrated.course.service.ICourseModuleService;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/modules")
@RequiredArgsConstructor
public class CourseModuleController {

    private final ICourseModuleService moduleService;

    // Public endpoints
    @GetMapping
    public ResponseEntity<List<ModuleResponse>> getModules(@PathVariable Long courseId) {
        return ResponseEntity.ok(moduleService.getModulesByCourse(courseId));
    }

    @GetMapping("/{moduleId}")
    public ResponseEntity<ModuleResponse> getModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId) {
        return ResponseEntity.ok(moduleService.getModuleById(courseId, moduleId));
    }

    // Admin endpoints
    @PostMapping("/admin")
    public ResponseEntity<ModuleResponse> createModule(
            @PathVariable Long courseId,
            @RequestBody ModuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(moduleService.createModule(courseId, request));
    }

    @PutMapping("/admin/{moduleId}")
    public ResponseEntity<ModuleResponse> updateModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @RequestBody ModuleRequest request) {
        return ResponseEntity.ok(moduleService.updateModule(courseId, moduleId, request));
    }

    @DeleteMapping("/admin/{moduleId}")
    public ResponseEntity<Void> deleteModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId) {
        moduleService.deleteModule(courseId, moduleId);
        return ResponseEntity.noContent().build();
    }
}
