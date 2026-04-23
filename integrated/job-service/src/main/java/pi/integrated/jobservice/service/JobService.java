package pi.integrated.jobservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.integrated.jobservice.dto.CreateJobRequest;
import pi.integrated.jobservice.dto.JobWithScoreDTO;
import pi.integrated.jobservice.model.Job;
import pi.integrated.jobservice.model.JobPublicationSchedule;
import pi.integrated.jobservice.model.JobStatus;
import pi.integrated.jobservice.repository.ApplicationRepository;
import pi.integrated.jobservice.repository.JobPublicationScheduleRepository;
import pi.integrated.jobservice.repository.JobRepository;
import pi.integrated.jobservice.repository.SavedJobRepository;
import pi.integrated.jobservice.repository.TeacherCvProfileRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobPublicationScheduleRepository scheduleRepository;
    private final TeacherCvProfileRepository cvProfileRepository;
    private final ApplicationMatchScoreService matchScoreService;
    private final SavedJobRepository savedJobRepository;
    private final ApplicationRepository applicationRepository;

    public Job createJob(CreateJobRequest req) {
        Job job = Job.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .location(req.getLocation())
                .subject(req.getSubject())
                .salaryMin(req.getSalaryMin())
                .salaryMax(req.getSalaryMax())
                .createdAt(LocalDateTime.now())
                .expiresAt(req.getExpiresAt())
                .build();

        if (req.getScheduledPublicationAt() != null && req.getScheduledPublicationAt().isAfter(LocalDateTime.now())) {
            // Schedule for later — don't set status OPEN yet
            job.setStatus(JobStatus.CLOSED);
            job = jobRepository.save(job);
            JobPublicationSchedule schedule = JobPublicationSchedule.builder()
                    .job(job)
                    .scheduledAt(req.getScheduledPublicationAt())
                    .published(false)
                    .build();
            scheduleRepository.save(schedule);
        } else {
            job.setStatus(JobStatus.OPEN);
            job = jobRepository.save(job);
        }
        return job;
    }

    public Job updateJob(Long id, CreateJobRequest req) {
        Job job = getJobOrThrow(id);
        job.setTitle(req.getTitle());
        job.setDescription(req.getDescription());
        job.setLocation(req.getLocation());
        job.setSubject(req.getSubject());
        job.setSalaryMin(req.getSalaryMin());
        job.setSalaryMax(req.getSalaryMax());
        if (req.getExpiresAt() != null) job.setExpiresAt(req.getExpiresAt());
        return jobRepository.save(job);
    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job getJobOrThrow(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
    }

    public List<Job> searchJobs(String title, String location, String subject) {
        return jobRepository.searchJobs(title, location, subject);
    }

    /**
     * Returns jobs with computed match scores for a given teacher's CV profile.
     */
    public List<JobWithScoreDTO> getJobsWithScoreForTeacher(Long teacherId) {
        String cvText = cvProfileRepository.findByUserId(teacherId)
                .map(p -> p.getExtractedText())
                .orElse("");

        return jobRepository.findByStatus(JobStatus.OPEN).stream()
                .map(job -> {
                    double score = matchScoreService.computeScore(cvText, job);
                    boolean saved = savedJobRepository.existsByUserIdAndJobId(teacherId, job.getId());
                    boolean applied = applicationRepository.findByJobIdAndTeacherId(job.getId(), teacherId).isPresent();
                    return JobWithScoreDTO.builder()
                            .id(job.getId())
                            .title(job.getTitle())
                            .description(job.getDescription())
                            .location(job.getLocation())
                            .subject(job.getSubject())
                            .salaryMin(job.getSalaryMin())
                            .salaryMax(job.getSalaryMax())
                            .status(job.getStatus())
                            .createdAt(job.getCreatedAt())
                            .expiresAt(job.getExpiresAt())
                            .matchScore(score)
                            .saved(saved)
                            .applied(applied)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /** Process scheduled publications (called by scheduler). */
    public void publishScheduledJobs() {
        List<JobPublicationSchedule> due = scheduleRepository
                .findByPublishedFalseAndScheduledAtBefore(LocalDateTime.now());
        for (JobPublicationSchedule schedule : due) {
            Job job = schedule.getJob();
            job.setStatus(JobStatus.OPEN);
            jobRepository.save(job);
            schedule.setPublished(true);
            scheduleRepository.save(schedule);
        }
    }
}
