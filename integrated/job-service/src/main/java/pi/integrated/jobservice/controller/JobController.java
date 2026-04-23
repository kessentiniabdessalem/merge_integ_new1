package pi.integrated.jobservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.integrated.jobservice.dto.CreateJobRequest;
import pi.integrated.jobservice.dto.JobWithScoreDTO;
import pi.integrated.jobservice.model.Job;
import pi.integrated.jobservice.service.JobService;
import pi.integrated.jobservice.service.SavedJobService;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final SavedJobService savedJobService;

    // ── Public ────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobOrThrow(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String subject) {
        return ResponseEntity.ok(jobService.searchJobs(title, location, subject));
    }

    // ── Authenticated: ranked list with match score ───────────────────────────

    @GetMapping("/ranked")
    public ResponseEntity<List<JobWithScoreDTO>> getRankedJobs(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(jobService.getJobsWithScoreForTeacher(userId));
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody CreateJobRequest req) {
        return ResponseEntity.ok(jobService.createJob(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody CreateJobRequest req) {
        return ResponseEntity.ok(jobService.updateJob(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    // ── Saved jobs ────────────────────────────────────────────────────────────

    @PostMapping("/{id}/save")
    public ResponseEntity<Void> saveJob(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        savedJobService.saveJob(userId, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<Void> unsaveJob(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        savedJobService.unsaveJob(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/saved")
    public ResponseEntity<?> getSavedJobs(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(savedJobService.getSavedJobs(userId));
    }
}
