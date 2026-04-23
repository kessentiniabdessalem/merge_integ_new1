package pi.integrated.course.service;

import pi.integrated.course.dto.ModuleRequest;
import pi.integrated.course.dto.ModuleResponse;

import java.util.List;

public interface ICourseModuleService {
    ModuleResponse createModule(Long courseId, ModuleRequest request);
    ModuleResponse getModuleById(Long courseId, Long moduleId);
    List<ModuleResponse> getModulesByCourse(Long courseId);
    ModuleResponse updateModule(Long courseId, Long moduleId, ModuleRequest request);
    void deleteModule(Long courseId, Long moduleId);
}
