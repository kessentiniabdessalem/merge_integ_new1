package pi.integrated.jobservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pi.integrated.jobservice.model.TeacherCvProfile;
import pi.integrated.jobservice.service.TeacherCvProfileService;

import java.util.Map;

@RestController
@RequestMapping("/api/cv-profiles")
@RequiredArgsConstructor
public class CvProfileController {

    private final TeacherCvProfileService cvProfileService;

    /**
     * Upload (or replace) the current user's CV file.
     * The JwtFilter puts the decoded userId into the request attribute "userId".
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TeacherCvProfile> upload(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        TeacherCvProfile saved = cvProfileService.uploadCv(userId, file);
        return ResponseEntity.ok(saved);
    }

    /**
     * Return the current user's CV profile (or 404 if none uploaded yet).
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMy(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return cvProfileService.getProfile(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(Map.of("message", "No CV uploaded yet")));
    }
}
