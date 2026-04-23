package pi.integrated.jobservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pi.integrated.jobservice.dto.ApplicationDTO;
import pi.integrated.jobservice.dto.UpdateApplicationRequest;
import pi.integrated.jobservice.model.ApplicationStatus;
import pi.integrated.jobservice.service.ApplicationService;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApplicationDTO> apply(
            @RequestParam Long jobId,
            @RequestParam(required = false) String motivation,
            @RequestParam(required = false) MultipartFile cv,
            @RequestParam(required = false) MultipartFile certificat,
            HttpServletRequest request) {
        Long teacherId = (Long) request.getAttribute("userId");
        String teacherName = (String) request.getAttribute("userName");
        return ResponseEntity.ok(
                applicationService.createApplication(jobId, teacherId, teacherName, motivation, cv, certificat));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateApplicationRequest req) {
        return ResponseEntity.ok(applicationService.updateStatus(id, req.getStatus()));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationDTO>> getByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ApplicationDTO>> myApplications(HttpServletRequest request) {
        Long teacherId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(applicationService.getApplicationsByTeacher(teacherId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplication(id));
    }
}
