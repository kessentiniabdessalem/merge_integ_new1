package pi.integrated.ai.controller;

import pi.integrated.ai.dto.StudyPlanRequest;
import pi.integrated.ai.dto.StudyPlanResponse;
import pi.integrated.ai.service.StudyPlanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/study-plan")
public class StudyPlanController {

    private static final Logger logger = LoggerFactory.getLogger(StudyPlanController.class);
    private final StudyPlanService studyPlanService;

    public StudyPlanController(StudyPlanService studyPlanService) {
        this.studyPlanService = studyPlanService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateStudyPlan(@RequestBody StudyPlanRequest request) {
        try {
            logger.info("Study plan requested for course: {}", request.getCourseTitle());
            StudyPlanResponse response = studyPlanService.generateStudyPlan(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error generating study plan", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("details", e.getCause() != null ? e.getCause().getMessage() : "");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
