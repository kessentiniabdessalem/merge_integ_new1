package pi.integrated.jobservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.integrated.jobservice.model.Rating;
import pi.integrated.jobservice.service.RatingService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<Rating> createRating(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        String studentName = (String) request.getAttribute("userName");
        Long teacherId = Long.valueOf(body.get("teacherId").toString());
        String teacherName = body.containsKey("teacherName") ? body.get("teacherName").toString() : "";
        Integer note = Integer.valueOf(body.get("note").toString());
        String commentaire = body.containsKey("commentaire") ? body.get("commentaire").toString() : null;
        return ResponseEntity.ok(
                ratingService.createRating(teacherId, teacherName, studentId, studentName, note, commentaire));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Rating>> getRatingsForTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(ratingService.getRatingsForTeacher(teacherId));
    }

    @GetMapping("/teacher/{teacherId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long teacherId) {
        return ResponseEntity.ok(ratingService.getAverageRatingForTeacher(teacherId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Rating>> myRatings(HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(ratingService.getRatingsByStudent(studentId));
    }

    @GetMapping
    public ResponseEntity<List<Rating>> getAllRatings() {
        return ResponseEntity.ok(ratingService.getAllRatings());
    }
}
